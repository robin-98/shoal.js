import * as serviceDeployer from './service_deployer'

import { utils, Sardines } from 'sardines-core'
import { RepositoryClient } from 'sardines-core'

export interface AgentInstance {
  hasHostInfoUpdated: boolean
  hostId: string|null
  providers: Sardines.Runtime.ProviderCache
}

export const sendDeployResultToRepository = async(deployResult: Sardines.Runtime.DeployResult|null|undefined, agent: AgentInstance) => {
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
  const data :any = {
      resourceId: agent.hostId,
      deployResult,
  }

  // use repo_client to send service runtimes to its self
  let res: Sardines.Runtime.ServiceRuntimeUpdateResult = await RepositoryClient.exec('updateServiceRuntime', data)
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

export const deployServices = async (targetServices: any, deployPlan: any, agent: any = {}, send: boolean = false): Promise<ServiceDeployment> => {
  if (!targetServices) {
      throw utils.unifyErrMesg('services are not correctly compiled', 'shoal', 'start')
  }
  const deployRes = await serviceDeployer.deploy(deployPlan, [targetServices], agent.providers, true)
  let repoRes = null
  if (send) {
      repoRes = await sendDeployResultToRepository(deployRes, agent)
  }
  return {deployResult: deployRes, repositoryResponse: repoRes}
}