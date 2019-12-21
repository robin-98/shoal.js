/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-08-05 10:00:22
 * @modify date 2019-08-05 10:00:22
 * @desc [description]
 */

import { RepositoryConnect } from './repo_connect'
import { Sardines, utils } from 'sardines-core'
import { Service } from './repo_data_structure'

// import * as fs from 'fs'
// const debugJson = (obj:any) => {
//   if (!obj || typeof obj !== 'object' || Object.keys(obj).length !== 1) throw 'unsupported object for debug'
//   const key = Object.keys(obj)[0]
//   fs.writeFileSync(`./debug-${key}.json`, JSON.stringify(obj[key],null,4))
// }

export interface ServiceDeploymentTargets {
  application: string   // application name
  services: { 
    module: string      // module name
    name: string        // service name, '*' for entire module
    version: string     // version number, '*' for latest one
  }[],
  hosts: string[]       // host names, if empty means to automatically find one
  version: string       // target version, '*' for latest one of the application
  useAllProviders: boolean
  providers?: any[]
  initParams?: any[]
}

export interface ExtendedServiceIdentity extends Sardines.ServiceIdentity {
  application_id?: string
  service_id?: string
}

export interface DeployResultCacheItem {
  entry: {
    type: Sardines.Runtime.ServiceEntryType
    providerName: string
    providerInfo: Sardines.ProviderPublicInfo
    // provider: Sardines.ProviderDefinition
  },
  services: {
    identity: ExtendedServiceIdentity
    settingsForProvider: Sardines.ServiceSettingsForProvider
    arguments?: Sardines.ServiceArgument[]
  }[]
}

export interface DeployResultCache {
  [appName: string]: {
    [pvdrkey: string]: DeployResultCacheItem
  }
}

export interface ProviderCache {[pvdrkey: string]: Sardines.ProviderDefinition}

export class RepositoryDeployment extends RepositoryConnect {
  constructor() {
    super()
  }

  protected async validateShoalUser(token: string) {
    const tokenObj = await this.validateToken(token, true)
    if (!this.shoalUser || !this.shoalUser.id 
      || !tokenObj || !tokenObj.account_id || tokenObj.account_id !== this.shoalUser.id) {
      throw 'Unauthorized user'
    }
  }

  public async updateResourceInfo(resourceInfo: Sardines.Runtime.Resource, token: string) {
    await this.validateShoalUser(token)
    const resourceInDB = await this.createOrUpdateResourceInfo(resourceInfo)

    // return 
    return resourceInDB
  }

  protected async createOrUpdateResourceInfo(resourceInfo: Sardines.Runtime.Resource) {
    if (resourceInfo.address && Object.keys(resourceInfo.address).length === 0) {
      delete resourceInfo.address
    }
    const resourceIdentity ={name: resourceInfo.name, account: resourceInfo.account, type: resourceInfo.type}
    let resourceInDB = await this.db!.get('resource', resourceIdentity)
    if (resourceInDB) {
      await this.db!.set('resource', resourceInfo, resourceIdentity)
    } else {
      await this.db!.set('resource', resourceInfo)
    }
    resourceInDB = await this.db!.get('resource', resourceIdentity)
    return resourceInDB
  }

  protected async generateDeployPlanFromBunchOfServices (serviceList: Service[]): Promise<{deployPlan: Sardines.DeployPlan,serviceDescObj: Sardines.ServiceDescriptionFile}[]|null> {
    const result = []
    const cacheSourceVersionServices: {[key: string]: Service[]}= {}
    for (let service of serviceList) {
      const key = `${service.source_id}:${service.version}`
      if (!cacheSourceVersionServices[key]) {
        cacheSourceVersionServices[key] = []
      }
      cacheSourceVersionServices[key].push(service)
    }
  
    for (let key of Object.keys(cacheSourceVersionServices)) {
      const pair = key.split(':')
      const sourceId = pair[0]
      const sourceVersion = pair[1]
      // Query source repository information
      const sourceInfo = await this.querySource({ id: sourceId }, '', true)
      if (!sourceInfo || !sourceInfo.type) continue
      const code: Sardines.LocationSettings = {
        locationType:  Sardines.LocationType[sourceInfo.type as keyof typeof Sardines.LocationType]
      }
      if (sourceInfo.url) code.url = sourceInfo.url
      if (sourceInfo.root) code.location = sourceInfo.root

      // create a new deploy plan, together with a services description object
      const services = cacheSourceVersionServices[key]
      const sampleService = services[0]
      const deployPlan: Sardines.DeployPlan = {
        providers: [],
        applications: [{
          name: sampleService.application!,
          code,
          version: sourceVersion,
          init: []
        }]
      }
      const serviceDescObj: Sardines.ServiceDescriptionFile = {
        application: sampleService.application!,
        services: []
      }
      // iterate the services
      for (let service of services) {
        serviceDescObj.services.push({
          name: service.name,
          module: service.module,
          arguments: service.arguments ? service.arguments : [],
          returnType: service.return_type || 'void',
          isAsync: (service.is_async),
          filepath: service.file_path!
        })
      }

      // save the deploy plan
      result.push({deployPlan, serviceDescObj})
    }
  
    if (result.length) return result
    else return null
  }

  public async deployServices(targets: ServiceDeploymentTargets, token: string, bypassToken: boolean = false) {
    if (!bypassToken) await this.validateShoalUser(token)
    
    const hosts = targets.hosts
    const application = targets.application
    const services = targets.services 
    const version = targets.version
    const initParams = targets.initParams
    const providers = targets.providers
    const res = []
    // application should be single
    if (application && 
      (application.indexOf(';')>=0 || application.indexOf(',')>=0 || application.indexOf(':')>=0)
      ) {
        throw 'Multiple application mode is not supported while deploy services'
    }

    // CAUTION: deployment is devided by source repositories/versions,
    // not only by applications
    // let serviceDescObjCache: {[version:string]:Sardines.ServiceDescriptionFile} = {}
    // console.log(serviceDescObjCache)
    let serviceQuery: any = {application, version}

    let serviceList: Service[]= []
    if (!services || services.length === 0) {
      // deploy all services of that application, 
      // use 'version' as target version of all services
      let serviceInsts = await this.queryService(serviceQuery, token, true)
      if (serviceInsts && !Array.isArray(serviceInsts)) {
        serviceList.push(serviceInsts)
      } else if(serviceInsts) {
        serviceList = <Service[]>serviceInsts
      }
    } else {
      // let serviceDescObj: Sardines.ServiceDescriptionFile = {
      //   services: [],
      //   application
      // }
      // console.log(serviceDescObj)
      for (let i=0; i<services.length; i++) {
        const targetService = services[i]
        // use targetService.version as version of all the target
        const tmpQuery: any = Object.assign({application}, targetService)
        const tmpServiceInsts = await this.queryService(<Service>tmpQuery, token, true)
        if (tmpServiceInsts) {
          if (!Array.isArray(tmpServiceInsts)){
            serviceList.push(tmpServiceInsts)
          } else {
            Array.prototype.push.apply(serviceList, tmpServiceInsts)
          }
        }
      }
    }

    // Generate deploy plan for distinct sources and versions
    const dplist = await this.generateDeployPlanFromBunchOfServices(serviceList)
    if (!dplist || !dplist.length) return null
    
    // Query target hosts and setup providers
    const hostInfoList = []
    if (!hosts || !hosts.length) {
      // automatically select a host
      const hostQuery: any = {
        status: Sardines.Runtime.RuntimeStatus.ready,
        type: Sardines.Runtime.ResourceType.host
      }
      const hostInfo = await this.db!.get('resource', hostQuery, {workload_percentage: 1}, 1)
      hostInfoList.push(hostInfo)
    } else {
      // validate hosts, which shall in format of '<user name>@<host name>'
      // or just a host id without '@' character
      for (let host of hosts) {
        if (!host || typeof host !== 'string') continue
        const hostQuery: any = {
          status: Sardines.Runtime.RuntimeStatus.ready,
          type: Sardines.Runtime.ResourceType.host
        }
        if (host.indexOf('@') > 0) {
          const pair = host.split('@')
          hostQuery.account = pair[0]
          hostQuery.name = pair[1]
        } else {
          hostQuery.id = host
        }
        const hostInfo = await this.db!.get('resource', hostQuery, {workload_percentage: 1}, 1)
        hostInfoList.push(hostInfo)
      }
    }

    // prepare deploy plans according to different host
    for (let hostInfo of hostInfoList) {
      if (!hostInfo || !hostInfo.providers || !Array.isArray(hostInfo.providers) || !hostInfo.providers.length) continue
      // generate deploy plan and service desc obj for the single host
      const deployPlanAndDescObjForHost: {deployPlan: any, serviceDescObj: any}[] = []
      for (let dp of dplist) {
        const {deployPlan, serviceDescObj} = dp
        deployPlan.providers = []
        Array.prototype.push.apply(deployPlan.providers, hostInfo.providers)
        // Add providers from request
        if (providers && Array.isArray(providers) && providers.length > 0) {
          for (let addedProvider of providers) {
            let found = false
            for (let provider of deployPlan.providers) {
              if (utils.isEqual(provider, addedProvider)) found = true
            }
            if (!found) {
              deployPlan.providers.push(addedProvider)
            }
          }
        }
        // populate init params
        if (initParams && Array.isArray(initParams) && initParams.length>0) {
          Array.prototype.push.apply(deployPlan.applications[0].init, initParams)
        }
        // populate providers application settings
        for (let service of serviceList) {
          if (!service.provider_settings || !Array.isArray(service.provider_settings) || !service.provider_settings.length) continue
          for (let ps of service.provider_settings) {
            if (!ps.protocol) continue
            for (let pvdr of hostInfo.providers) {
              if (!pvdr.protocol || pvdr.protocol.toLowerCase() !== ps.protocol.toLowerCase()) continue
              if (!pvdr.applicationSettings) {
                pvdr.applicationSettings = [{
                  application: service.application!,
                  serviceSettings: []
                }]
              }
              delete ps.protocol
              pvdr.applicationSettings[0].serviceSettings.push({
                module: service.module!,
                name: service.name,
                settings: ps
              })
            }
          }
        }
        // TODO: push to target host
        // using sardines-core invoke to request
        deployPlanAndDescObjForHost.push({deployPlan, serviceDescObj})
      }

      // deploy on host
      const agentRes = await this.invokeHostAgent({id: hostInfo.id}, 'deployService', deployPlanAndDescObjForHost)
      if (agentRes.res) {
        res.push({hostInfo, res: agentRes.res})
      } else if (agentRes.error) {
        console.log('Error while requesting agent:', agentRes.error)
      }
    }

    if (!res.length) return null
    else return res
  }

  async parseDeployResult(runtimeOfApps: Sardines.Runtime.DeployResult):Promise<{deployResult: DeployResultCache, providers: ProviderCache}> {
    const cacheApps: DeployResultCache = {}
    const pvdrCache: {[pvdrkey: string]: Sardines.ProviderDefinition} = {}
    for (let pvdr of runtimeOfApps.providers) {
      // remove redundant data: service settings for provider
      if (pvdr.applicationSettings) {
        for (let appSetting of pvdr.applicationSettings) {
          if (appSetting.serviceSettings) delete appSetting.serviceSettings
        }
      }
      pvdrCache[utils.getKey(pvdr.providerSettings.public)] = pvdr
    }
    for (let app of Object.keys(runtimeOfApps.services)) {
      let cacheEntries : {[pvdrkey: string]: DeployResultCacheItem} = {}
      cacheApps[app] = cacheEntries
      let serviceRuntime = runtimeOfApps.services[app]
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
        const identity: ExtendedServiceIdentity = runtime.identity
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
              providerName: entry.providerName||'unknown',
              providerInfo: entry.providerInfo,
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
    return {deployResult: cacheApps, providers: pvdrCache}
  }

  async uploadServiceDeployResult(runtimeOfApps: Sardines.Runtime.DeployResult, token: string, bypassToken: boolean = false):Promise<Sardines.Runtime.ServiceRuntimeUpdateResult> {
    if (!bypassToken) await this.validateToken(token, true)

    if (!runtimeOfApps || !runtimeOfApps.resourceId || !runtimeOfApps.providers || !runtimeOfApps.services) {
      throw utils.unifyErrMesg('invalid deploy result', 'repository', 'update service runtime')
    }
    if (!runtimeOfApps.resourceId) {
      throw utils.unifyErrMesg('resourceId is missing in service runtime', 'repository', 'update service runtime')
    }
    let resourceId:string = runtimeOfApps.resourceId
    
    const dpres = await this.parseDeployResult(runtimeOfApps)
    const cacheApps = dpres.deployResult
    const cachePvdr = dpres.providers
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
          const runtimeQuery: any = Object.assign({
            resource_id: resourceId
          }, identity, entry)

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
          
          // remove undefined properties
          for (let prop in runtimeQuery) {
            if (typeof runtimeQuery[prop] === 'undefined') {
              delete runtimeQuery[prop]
            }
          }
          const runtimeData = Object.assign({
            last_active_on: Date.now(),
            status: Sardines.Runtime.RuntimeStatus.ready,
            provider_raw: cachePvdr[pvdrKey],
          }, runtimeQuery)
          if (serviceArguments && identity.application !== 'sardines') {
            runtimeData.init_params = serviceArguments
          }
          if (settingsForProvider) {
            runtimeData.settings_for_provider = settingsForProvider
          }
          // save service runtime in db
          try {
            let runtimeInst = await this.db!.get('service_runtime', runtimeQuery)

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

  async reloadPendingServices(resourceInDB: any) {
    if (!resourceInDB || !resourceInDB.id) return
    // Then get all service runtimes which were deployed on this host, except sardines services
    const pendingServiceRuntimes = await this.db!.get('service_runtime', {
      resource_id: resourceInDB.id,
      status: `ne:${Sardines.Runtime.RuntimeStatus.ready}`,
      application: 'ne:sardines'
    })

    let targetServiceRuntimeList: any[]= []
    if (pendingServiceRuntimes && !Array.isArray(pendingServiceRuntimes)) {
      targetServiceRuntimeList = [pendingServiceRuntimes]
    } else if (pendingServiceRuntimes && Array.isArray(pendingServiceRuntimes)) {
      targetServiceRuntimeList = pendingServiceRuntimes
    }
    // Convert pending service runtime data to ServiceDeploymentTargets
    // all service runtimes may spread on many applications, versions, hosts, providers
    const targetCache: {[key:string]: ServiceDeploymentTargets} = {}
    for (let serviceRuntimeInDB of targetServiceRuntimeList) {
      const cachekey = `${serviceRuntimeInDB.resource_id}:${serviceRuntimeInDB.application}:${serviceRuntimeInDB.version}:${utils.getKey(serviceRuntimeInDB.provider_info)}`

      if (!targetCache[cachekey]) targetCache[cachekey] = {
        application: serviceRuntimeInDB.application,
        services: [],
        hosts: [resourceInDB.id],
        version: serviceRuntimeInDB.version,
        useAllProviders: false,
        providers: [serviceRuntimeInDB.provider_raw],
        initParams: []
      }
      const target = targetCache[cachekey]
      target.services.push({
        module: serviceRuntimeInDB.module,
        name: serviceRuntimeInDB.name,
        version: serviceRuntimeInDB.version
      })

      if (serviceRuntimeInDB.settings_for_provider) {
        const provider = target.providers![0]
        if (!provider.applicationSettings) {
          provider.applicationSettings = [{
            application: serviceRuntimeInDB.application,
            commonSettings: {},
            serviceSettings: []
          }]
        }
        const appSettings = provider.applicationSettings[0]
        if (!appSettings.serviceSettings) appSettings.serviceSettings = []
        appSettings.serviceSettings.push({
          module: serviceRuntimeInDB.module,
          name: serviceRuntimeInDB.name,
          settings: serviceRuntimeInDB.settings_for_provider
        })
      }
      
      if (serviceRuntimeInDB.init_params) {
        target.initParams!.push({
          service: {
            module: serviceRuntimeInDB.module,
            name: serviceRuntimeInDB.name
          },
          arguments: serviceRuntimeInDB.init_params
        })
      }
    }
    // let the service deploy all the service runtimes other than sardines services
    const deployJobs: ServiceDeploymentTargets[] = []
    for (let key of Object.keys(targetCache)) {
      deployJobs.push(targetCache[key])
    }
    if (deployJobs.length) {
      const self = this
      const execDeployJob = async() => {
        setTimeout(async() => {
          if (!deployJobs.length) return 
          const job = deployJobs[0]
          try {
            const res = await self.deployServices(job, '', true)
            console.log(`response from agent [${resourceInDB.id}]:`, res)
            deployJobs.shift()
          } catch (e) {
            console.error(`ERROR while deploying pending services for agent [${resourceInDB.id}]:`, e)
          }
          await execDeployJob()
        }, this.heartbeatTimespan)
      }
      await execDeployJob()
    }
  }
}
