/*
 * Created by Robin Sun
 * Create time: 2019-12-26
 */

import { Sardines, utils, Factory } from 'sardines-core'
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
    
    console.log(`[Agent] removing services:`,data)
    if (!data || !data.applications || !data.applications.length || data.applications.indexOf('sardines') >= 0
      || !data.modules || !data.modules.length || !data.services || !data.services.length || !data.versions || !data.versions.length) {
      throw `illegal request of removing service runtimes`
    }

    for (let pvdrkey of Object.keys(this.agentState.providers)) {
      const serviceCache: Sardines.Runtime.ServiceCache = this.agentState.providers[pvdrkey].serviceCache
      const pvdrInst = Factory.getInstance('whatever', {}, 'provider', pvdrkey)
      if (!pvdrInst) continue
      for (let appName of Object.keys(serviceCache)) {
        if (appName === 'sardines') continue
        for (let moduleName of Object.keys(serviceCache[appName])) {
        for (let serviceName of Object.keys(serviceCache[appName][moduleName])) {
        for (let version of Object.keys(serviceCache[appName][moduleName][serviceName])) {
        if (data.versions.indexOf('*') >=0 || data.versions.indexOf(version) >= 0) {
        if (data.services.indexOf('*') >=0 || data.services.indexOf(serviceName) >= 0) {
        if (data.modules.indexOf('*') >= 0 || data.modules.indexOf(moduleName) >= 0) {
        if (data.applications.indexOf('*') >=0 || data.applications.indexOf(appName) >= 0) {
          if (typeof serviceCache[appName][moduleName][serviceName][version] !== 'object') continue
          const cacheItem: Sardines.Runtime.ServiceCacheItem = <Sardines.Runtime.ServiceCacheItem>(serviceCache[appName][moduleName][serviceName][version])
          if (typeof pvdrInst.removeService === 'function' && cacheItem.serviceSettingsInProvider) {
            try {
              const res = await pvdrInst.removeService(cacheItem.serviceSettingsInProvider)
              if (res) {
                console.log(`[agent] service [${appName}:${moduleName}:${serviceName}:${version} has been removed from provider [${pvdrkey}]], provider response:`, res)
              }
            } catch (e) {
              console.error(`[agent] Error while removing service [${appName}:${moduleName}:${serviceName}:${version} from provider [${pvdrkey}]]:`, e)
            }
          }
        }}}}}}}
      }
    }

    return data
  }
}