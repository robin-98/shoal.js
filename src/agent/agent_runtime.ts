/*
 * Created by Robin Sun
 * Create time: 2019-12-26
 */

import { Sardines, utils } from 'sardines-core'
import { SardinesAgentInit } from './agent_init'
import { ServerUtils } from '../interfaces'
import * as deployer from '../deployer'

export interface ServiceDeployPlan {
  deployPlan: Sardines.DeployPlan
  serviceDescObj: Sardines.ServiceDescriptionFile
}

export class SardinesAgentRuntime extends SardinesAgentInit {
  constructor() {
    super()
  }

  async deployService (data: ServiceDeployPlan[]) {
    if (!data || !Array.isArray(data) || !data.length) {
      throw utils.unifyErrMesg(`Invalid service deployment command from repository`, 'agent', 'deploy service')
    }
    let result:any = []
    for (let dp of data) {
      let res: any = await deployer.deployServices(dp.serviceDescObj, dp.deployPlan, this.agentState, true)
      result.push(res)
    }
    ServerUtils.debugJson({agentState: this.agentState})
    return result
  }

  async removeServices(data: {applications: string[], modules: string[], services: string[], versions: string[]}) {
    
    console.log(data)

  }
}