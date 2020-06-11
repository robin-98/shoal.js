import * as serviceDeployer from './service_deployer'

import { utils, Sardines } from 'sardines-core'
import { RepositoryClient } from 'sardines-core'
import { AgentState } from '../interfaces'
import { parseDeployPlanFile } from './deployer_utils'
import * as path from 'path'
import * as proc from 'process'
import * as fs from 'fs'

export const sendDeployResultToRepository = async(deployResult: Sardines.Runtime.DeployResult|null|undefined, agent: AgentState) => {
  if (!deployResult) {
      throw 'invalid deploy result of services'
  }

  // wait for agent to get host id
  while (!agent.hasHostInfoUpdated || !agent.hostId ) {
      await utils.sleep(100)
  }

  // if config file exists it will be used 
  // to setup repo_client module automatically
  // no worry about using repo_client module

  // wrap hostId
  deployResult.resourceId = agent.hostId

  // use repo_client to send service runtimes to its self
  let res: Sardines.Runtime.ServiceRuntimeUpdateResult = await RepositoryClient.exec('uploadServiceDeployResult', deployResult)
  if (res) {
    for (let appName of Object.keys(res)) {
      for (let pvdrkey of Object.keys(res[appName])) {
        for (let service of res[appName][pvdrkey]) {
          Sardines.Transform.pushServiceIntoProviderCache(agent.providers, pvdrkey, null, service, service.runtimeId)
        }
      }
    }
  }
  return res

  // or just invoke repository method from memory
  // it's also OK to use repository instance from inside
  // because at this time, the repository instance has been initialized
  // and database is also ready
  // but firstly, need to login using shoalUser
  // it's duplicated process with repo_client, so don't use inside invocation
}

export interface ServiceDeployment {
  deployResult: any
  repositoryResponse: any
}

export const deployServices = async (targetServices: any, deployPlan: any, agentState: AgentState, send: boolean = false): Promise<ServiceDeployment> => {
  if (!targetServices) {
      throw utils.unifyErrMesg('services are not correctly compiled', 'shoal', 'start')
  }
  const deployRes:Sardines.Runtime.DeployResult|null = await serviceDeployer.deploy(deployPlan, [targetServices], agentState.providers, true)
  
  if (deployPlan.tags && deployRes) deployRes.tags = deployPlan.tags
  let repoRes = null
  if (send && deployRes) {
      repoRes = await sendDeployResultToRepository(deployRes, agent)
  }
  return {deployResult: deployRes, repositoryResponse: repoRes}
}

// Deploy services by service definition file and service deploy plan file
export const deployServicesByFiles = async (serviceDefinitionFile: string, serviceDeployPlanFile: string, agentState: AgentState, send: boolean = true) => {
  const serviceFilePath = path.resolve(proc.cwd(), serviceDefinitionFile)
  if (fs.existsSync(serviceFilePath)) {
      const targetServices = JSON.parse(fs.readFileSync(serviceFilePath).toString())
      const deployPlan = parseDeployPlanFile(path.resolve(proc.cwd(), serviceDeployPlanFile))
      const res = await deployServices(targetServices, deployPlan, agentState, send)
      if (res) return res
      else throw 'deploy failed'
  } else {
      throw `can not access service description file [${serviceFilePath}]`
  }
}