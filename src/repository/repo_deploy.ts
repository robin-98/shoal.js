/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-08-05 10:00:22
 * @modify date 2019-08-05 10:00:22
 * @desc [description]
 */

import { RepositoryHeart } from './repo_heart'
import { Sardines } from 'sardines-core'
import { utils } from 'sardines-core'
import { Service } from './repo_data_structure'
import { Core } from 'sardines-core'

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

export class RepositoryDeployment extends RepositoryHeart {
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
  public async createOrUpdateResourceInfo(resourceInfo: Sardines.Runtime.Resource, token: string) {
    await this.validateShoalUser(token)
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

  public async deployServices(targets: ServiceDeploymentTargets, token: string) {
    await this.validateShoalUser(token)
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
        res.push({hostInfo, deployPlan, serviceDescObj})
      }
      // find out what provider the agent is using
      const {provider_info, settings_for_provider, entry_type} = await this.db!.get('service_runtime', {
        resource_id: hostInfo.id,
        application: 'sardines',
        module: '/agent'
      }, null, 1, 0, ['provider_info', 'settings_for_provider', 'entry_type'])
      // send deploy plan and service description objects to the host using the particular provider
      try {
        const runtime: Sardines.Runtime.Service = {
          identity: {
            application: 'sardines',
            module: '/agent',
            name: 'deployService'
          },
          entries: [{
            providerInfo: provider_info,
            settingsForProvider: settings_for_provider,
            type: entry_type
          }]
        }
        const res = await Core.invoke(runtime, deployPlanAndDescObjForHost)
        console.log('response from agent:')
        utils.inspectedLog(res)
      } catch (e) {
        console.log('Error while requesting agent:')
        utils.inspectedLog(e)
      }
    }

    if (!res.length) return null
    else return res
  }
}
