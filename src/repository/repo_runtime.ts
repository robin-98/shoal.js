/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-09-20 11:59:05
 * @modify date 2019-09-20 11:59:05
 * @desc [description]
 */

import { RepositoryDeployment } from './repo_deploy'
import { SystemLoad } from '../interfaces/system_load'
import { Sardines } from 'sardines-core'
import { Service } from './repo_data_structure'
import { utils } from 'sardines-core'

const calcWorkload = (sysload: SystemLoad):number => {
  let load = 100
  load -= sysload.cpu.idle
  return Math.round(load)
}


export interface  RuntimeQueryObject {
  name?: string
  type?: Sardines.Runtime.ResourceType
  account?: string
  service_id?: string
  status?: Sardines.Runtime.RuntimeStatus
  workload_percentage?: string
}

export class RepositoryRuntime extends RepositoryDeployment {
  constructor() {
    super()
  }
  protected defaultLoadBalancingStrategy = Sardines.Runtime.LoadBalancingStrategy.evenWorkload
  protected workloadThreshold = 85

  public async resourceHeartbeat(sysload: SystemLoad, token:string) {
    let tokenObj = await this.validateToken(token, true)
    if (!this.shoalUser || !this.shoalUser.id 
      || !tokenObj || !tokenObj.account_id || tokenObj.account_id !== this.shoalUser.id) {
      throw 'Unauthorized user'
    }

    const resourcePerf = await this.db!.set('resource_performance', sysload)
    if (resourcePerf) {
      if (sysload.resource_id) {
        const workload = calcWorkload(sysload)
        const newStatus = {
          workload_percentage: workload,
          status: Sardines.Runtime.RuntimeStatus.ready,
          last_active_on: Date.now()
        }
        await this.db!.set('resource', newStatus, {id: sysload.resource_id})
        await this.db!.set('service_runtime', newStatus, {resource_id: sysload.resource_id})
      }
      return 'OK'
    }
    return null
  }

  protected async findAvailableRuntime(type:Sardines.Runtime.RuntimeTargetType, target: Service|Sardines.Runtime.Resource, strategy: Sardines.Runtime.LoadBalancingStrategy = this.defaultLoadBalancingStrategy) {
    let { runtimeObj, table } = this.getRuntimeQueryObj(type, target)
    runtimeObj.status = Sardines.Runtime.RuntimeStatus.ready
    runtimeObj.workload_percentage = `le:${this.workloadThreshold}`
    const orderby = { workload_percentage: strategy === Sardines.Runtime.LoadBalancingStrategy.workloadFocusing ? -1 : 1}
    let runtimeInst = await this.db!.get(table, runtimeObj, orderby, 1)
    return runtimeInst
  }

  protected getRuntimeQueryObj(type: Sardines.Runtime.RuntimeTargetType, target: Service|Sardines.Runtime.Resource) {
    let runtimeObj: RuntimeQueryObject|null = null, table = null
    switch (type) {
      case Sardines.Runtime.RuntimeTargetType.service:
        runtimeObj = {
          service_id: (<Service>target).id,
        }
        table = 'service_runtime'
        break
      case Sardines.Runtime.RuntimeTargetType.host: default: 
        runtimeObj = {
          name: (<Sardines.Runtime.Resource>target).name,
          type: (<Sardines.Runtime.Resource>target).type,
          account: (<Sardines.Runtime.Resource>target).account,
        }
        table = 'resource'
        break
    }
    return { runtimeObj, table }
  }

  async fetchServiceRuntime(serviceIdentity: Sardines.ServiceIdentity|Sardines.ServiceIdentity[], token: string, bypassToken: boolean = false): Promise<any> {
    if (!serviceIdentity || !token) return null
    if (!bypassToken) await this.validateToken(token, true)
    if (Array.isArray(serviceIdentity)) {
      let res = []
      for (let i=0; i<serviceIdentity.length; i++) {
        let resItem: Sardines.Runtime.Service|null = await this.fetchServiceRuntime(serviceIdentity[i], token, bypassToken=true)
        res.push(resItem)
      }
      return res
    } else {
      let service = <Service|null>await this.queryService(serviceIdentity, token, bypassToken = true)
      if (service) {
        let runtime = await this.findAvailableRuntime(Sardines.Runtime.RuntimeTargetType.service, service)
        // if (!runtime) {
        //   // notify some resource to deploy one instance of the service
        //   runtime = await this.deployService(service)
        //   // runtime could be null if:
        //   // 1. there have no available resource to deploy the service
        //   // 2. someone else is doing the deployment job
        // }
        return runtime
      }
    }
    return null
  }

  async updateServiceRuntime(runtimeOfApps: any, token: string, bypassToken: boolean = false) {
    if (!bypassToken) await this.validateToken(token, true)

    if (!runtimeOfApps || !runtimeOfApps.deployResult) {
      throw utils.unifyErrMesg('invalid service runtime', 'repository', 'update service runtime')
    }
    if (!runtimeOfApps.resourceId) {
      throw utils.unifyErrMesg('resourceId is missing in service runtime', 'repository', 'update service runtime')
    }
    let resourceId:string = runtimeOfApps.resourceId
    const cacheApps: {[key: string]: any} = {}
    for (let app of Object.keys(runtimeOfApps.deployResult)) {
      let cacheEntries : {[key: string]: any} = {}
      cacheApps[app] = cacheEntries
      let serviceRuntime = runtimeOfApps.deployResult[app]
      // query appId
      let appId = null
      try {
        appId = await this.db!.get('application', {name: app})
        if (!appId) {
          if (app !== 'sardines') {
            throw `Unregistered application [${app}] is not allowed to register service runtime`
          }
        }
      } catch (e) {
        console.error(`ERROR while querying application id application ${app}`, e)
        continue
      }
      
      if (!serviceRuntime || !serviceRuntime.length) {
        console.error(`ERROR: can not log empty service runtime for application [${app}]`)
        continue
      }
      for (let runtime of serviceRuntime) {
        if (!runtime || !runtime.identity || !runtime.entries || !Array.isArray(runtime.entries)) continue
        const identity = runtime.identity
        if (appId) identity.application_id = appId
        else identity.application = app
        if (!identity.module || !identity.name || !identity.version) continue
        if (identity.version === '*') {
          // query latest version for the service
          try {
            const serviceInfo = await this.db!.get('service', identity, {create_on: -1}, 1)
            if (!serviceInfo && app !== 'sardines') {
              console.error(`logging runtime for unregistered service ${app}:${identity.module}:${identity.name}`)
              throw `unregistered service is not allowed to register service runtime`
            } else if (serviceInfo) {
              identity.version = serviceInfo.version
              identity.service_id = serviceInfo.id
            }
          } catch (e) {
            console.error(`ERROR while querying service version for service runtime ${identity.application}:${identity.module}:${identity.name}`,e)
            continue
          }
        }
        for (let entry of runtime.entries) {
          if (!entry.providerInfo || !entry.providerInfo.driver || !entry.providerInfo.protocol) continue
          const pvdrKey = `${entry.type}|${entry.providerName}|${JSON.stringify(entry.providerInfo)}`
          if (!cacheEntries[pvdrKey]) cacheEntries[pvdrKey] = {
            entry: {
              type: entry.type,
              providerName: entry.providerName,
              providerInfo: entry.providerInfo,
              resource_id: entry.resource_id
            },
            services: []
          }
          const cache = cacheEntries[pvdrKey]
          cache.services.push({identity, settingsForProvider: entry.settingsForProvider})
        }
      }
    }
    for (let app in cacheApps) {
      for (let runtime in cacheApps[app]) {
        const entry = cacheApps[app][runtime].entry
        const services = cacheApps[app][runtime].services
        for (let service of services) {
          const identity = service.identity
          const settingsForProvider = service.settingsForProvider
          if (!identity.service_id && app !== 'sardines') {
            // query service
            try {
              const serviceInfo = <Service>await this.queryService(identity, token, true)
              if (serviceInfo) {
                identity.service_id = serviceInfo.id 
              }
            } catch (e) {
              console.error(`Error while querying service info for service ${app}:${identity.module}:${identity.name}`, e)
              continue
            }
          }
          // prepare service runtime data in db
          const runtimeQuery = Object.assign({}, identity, entry)
          runtimeQuery.settingsForProvider = settingsForProvider
          runtimeQuery.resource_id = resourceId
          // convert properties to db columns
          for (let prop of [
            {p:'providerName', db:'provider_name'},
            {p:'providerInfo', db:'provider_info'},
            {p:'settingsForProvider', db:'settings_for_provider'},
            {p:'type', db:'entry_type'}
          ]) {
            runtimeQuery[prop.db] = runtimeQuery[prop.p]
            delete runtimeQuery[prop.p]
          }
          // remove undefined properties
          for (let prop in runtimeQuery) {
            if (typeof runtimeQuery[prop] === 'undefined') {
              delete runtimeQuery[prop]
            }
          }
          // save service runtime in db
          try {
            const runtimeInst = await this.db!.get('service_runtime', runtimeQuery)
            const runtimeData = Object.assign({}, runtimeQuery)
            runtimeData.status = Sardines.Runtime.RuntimeStatus.ready
            if (!runtimeInst) {
              await this.db!.set('service_runtime', runtimeData)
            } else {
              await this.db!.set('service_runtime', runtimeData, runtimeQuery)
            }
          } catch(e) {
            console.error(`Error while saving runtime for service ${app}:${identity.module}:${identity.name}`, e)
          }
        }
      }
    }
    return 'OK'
  }
}