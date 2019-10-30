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

  public async resourceHeartbeat(data: {load: SystemLoad, runtimes: string[]}, token:string) {
    let sysload = data.load
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

        if (data.runtimes && Array.isArray(data.runtimes) && data.runtimes.length) {
          await this.db!.set('service_runtime', newStatus, {id: data.runtimes})
        }
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

  async fetchServiceRuntime(serviceIdentity: Sardines.ServiceIdentity|Sardines.ServiceIdentity[], token: string, bypassToken: boolean = false): Promise<Sardines.Runtime.Service|Sardines.Runtime.Service[]|null> {
    if (!serviceIdentity || !token) return null
    if (!bypassToken) await this.validateToken(token, true)
    if (Array.isArray(serviceIdentity)) {
      let res: Sardines.Runtime.Service[] = []
      for (let i=0; i<serviceIdentity.length; i++) {
        let resItem: Sardines.Runtime.Service|null = <Sardines.Runtime.Service|null>await this.fetchServiceRuntime(serviceIdentity[i], token, bypassToken=true)
        if (resItem) res.push(resItem)
      }
      return res
    } else {
      let serviceQuery: any = {}
      if (!serviceIdentity.application || !serviceIdentity.module ||!serviceIdentity.name) {
        throw utils.unifyErrMesg(`Invalid service while querying service runtime`, 'repository', 'fetch service runtime')
      }
      serviceQuery.application = serviceIdentity.application
      serviceQuery.module = serviceIdentity.module
      serviceQuery.name = serviceIdentity.name
      if (serviceIdentity.version && serviceIdentity.version !== '*') serviceQuery.version = serviceIdentity.version

      let service  :Service|null = null
      if (serviceIdentity.application !== 'sardines') service = <Service|null>await this.queryService(serviceQuery, token, bypassToken = true)
      if (serviceIdentity.application === 'sardines' || service) {
        if (service) serviceQuery = { service_id: service.id }
        let runtime :any = await this.findAvailableRuntime(Sardines.Runtime.RuntimeTargetType.service, serviceQuery)
        if (runtime) {
          let result: Sardines.Runtime.Service = {
            identity: {
              application: serviceIdentity.application,
              module: serviceIdentity.module,
              name: serviceIdentity.name,
              version: runtime.version
            },
            entries: [{
              type: runtime.entry_type,
              providerInfo: runtime.provider_info,
              settingsForProvider: runtime.settings_for_provider
            }],
            expireInSeconds: runtime.expire_in_seconds
          }
          if (service) {
            result.arguments = service.arguments
            result.returnType = service.return_type
          }
          return result
        }
      }
    }
    return null
  }

  async parseDeployResult(runtimeOfApps: any) {
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
        } else if (appId.id) {
          appId = appId.id
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
        identity.application = app
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
              if (!identity.application_id && serviceInfo.application_id) {
                identity.application_id = serviceInfo.application_id
              }
            }
          } catch (e) {
            console.error(`ERROR while querying service version for service runtime ${identity.application}:${identity.module}:${identity.name}`,e)
            continue
          }
        }
        
        for (let entry of runtime.entries) {
          if (!entry.providerInfo || !entry.providerInfo.driver || !entry.providerInfo.protocol) continue
          const pvdrKey = utils.getKey(entry.providerInfo)
          if (!cacheEntries[pvdrKey]) cacheEntries[pvdrKey] = {
            entry: {
              type: entry.type,
              providerName: entry.providerName,
              providerInfo: entry.providerInfo,
              resource_id: entry.resource_id
            },
            services: []
          }
          const rtInst: any = {identity, settingsForProvider: entry.settingsForProvider}
          if (runtime.arguments) {
            rtInst.arguments = runtime.arguments
          }
          const cache = cacheEntries[pvdrKey]
          cache.services.push(rtInst)
        }
      }
    }
    return cacheApps
  }

  async updateServiceRuntime(runtimeOfApps: any, token: string, bypassToken: boolean = false):Promise<Sardines.Runtime.ServiceRuntimeUpdateResult> {
    if (!bypassToken) await this.validateToken(token, true)

    if (!runtimeOfApps || !runtimeOfApps.deployResult) {
      throw utils.unifyErrMesg('invalid service runtime', 'repository', 'update service runtime')
    }
    if (!runtimeOfApps.resourceId) {
      throw utils.unifyErrMesg('resourceId is missing in service runtime', 'repository', 'update service runtime')
    }
    let resourceId:string = runtimeOfApps.resourceId
    
    const cacheApps = await this.parseDeployResult(runtimeOfApps)
    // Save service runtime into database by apps and entries
    const result: Sardines.Runtime.ServiceRuntimeUpdateResult = {}
    for (let app in cacheApps) {
      result[app] = {}
      for (let pvdrKey in cacheApps[app]) {
        const entry = cacheApps[app][pvdrKey].entry
        const services = cacheApps[app][pvdrKey].services
        result[app][pvdrKey] = []
        for (let service of services) {
          const identity = service.identity
          const settingsForProvider = service.settingsForProvider
          const serviceArguments = service.arguments
          if (!identity.service_id && app !== 'sardines') {
            // query service
            try {
              const serviceInfo = <Service>await this.queryService(identity, token, true)
              if (serviceInfo) {
                identity.service_id = serviceInfo.id 
                if (serviceInfo.application_id && !identity.application_id) {
                  identity.application_id = serviceInfo.application_id
                }
              }
            } catch (e) {
              console.error(`Error while querying service info for service ${app}:${identity.module}:${identity.name}`, e)
              continue
            }
          }
          // prepare service runtime data in db
          const runtimeQuery: any = Object.assign({}, identity, entry)
          if (serviceArguments && identity.application !== 'sardines') {
            runtimeQuery.arguments = serviceArguments
          }
          
          runtimeQuery.settingsForProvider = settingsForProvider
          runtimeQuery.resource_id = resourceId
          // convert properties to db columns
          for (let prop of [
            {p:'providerName', db:'provider_name'},
            {p:'providerInfo', db:'provider_info'},
            {p:'type', db:'entry_type'},
          ]) {
            if (typeof runtimeQuery[prop.p] === 'undefined') continue
            runtimeQuery[prop.db] = runtimeQuery[prop.p]
            delete runtimeQuery[prop.p]
          }
          // Remove useless properties
          // These properties could have deep objects, which may get null when querying
          for (let prop of ['arguments', 'settingsForProvider']) {
            if (runtimeQuery[prop]) delete runtimeQuery[prop]
          }
          // remove undefined properties
          for (let prop in runtimeQuery) {
            if (typeof runtimeQuery[prop] === 'undefined') {
              delete runtimeQuery[prop]
            }
          }
          // save service runtime in db
          try {
            let runtimeInst = await this.db!.get('service_runtime', runtimeQuery)
            const runtimeData = Object.assign({
              last_active_on: Date.now(),
              status: Sardines.Runtime.RuntimeStatus.ready
            }, runtimeQuery)

            if (!runtimeInst) {
              await this.db!.set('service_runtime', runtimeData)
              runtimeInst = await this.db!.get('service_runtime', runtimeQuery)
            } else {
              await this.db!.set('service_runtime', runtimeData, runtimeQuery)
            }
            if (Array.isArray(runtimeInst)) {
              runtimeInst = runtimeInst[0]
            }
            if (!runtimeInst) {
              console.error('ERROR: can not find or create a new service runtime for service:', runtimeQuery)
            } else {
              result[app][pvdrKey].push({
                application: runtimeQuery.application,
                module: runtimeQuery.module,
                name: runtimeQuery.name,
                version: runtimeQuery.version,
                runtimeId: runtimeInst.id
              })
            }
          } catch(e) {
            console.error(`Error while saving runtime for service ${app}:${identity.module}:${identity.name}`, e)
            // Todo: return error for particular service runtime
          }
        }
      }
    }
    return result
  }
}