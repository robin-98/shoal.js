import * as serviceDeployer from './service_deployer'
import * as agent from '../agent'

import { utils, Sardines } from 'sardines-core'
import { RepositoryClient } from 'sardines-core'

export const sendDeployResultToRepository = async(deployResult: Sardines.Runtime.DeployResult|null|undefined) => {
  if (!deployResult) {
      throw 'invalid deploy result of services'
  }

  // wait for agent to get host id
  while (!agent.hasHostStatStarted || !agent.hostId) {
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
  let res = await RepositoryClient.exec('updateServiceRuntime', data)

  return res

  // or just invoke repository method from memory
  // it's also OK to use repository instance from inside
  // because at this time, the repository instance has been initialized
  // and database is also ready
  // but firstly, need to login using shoalUser
  // it's duplicated process with repo_client, so don't use inside invocation
}

export const deployServices = async (targetServices: any, deployPlan: any, send: boolean = true) => {
  if (!targetServices) {
      throw utils.unifyErrMesg('services are not correctly compiled', 'shoal', 'start')
  }
  const deployRes = await serviceDeployer.deploy(deployPlan, [targetServices], true)
  let repoRes = null
  if (send) {
      repoRes = await sendDeployResultToRepository(deployRes)
  }
  return {deployResult: deployRes, repositoryResponse: repoRes}
}