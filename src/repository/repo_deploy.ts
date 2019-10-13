/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-08-05 10:00:22
 * @modify date 2019-08-05 10:00:22
 * @desc [description]
 */

import { RepositoryLifeCycle } from './repo_data_lifecycle'
import { Sardines } from 'sardines-core'
import { Service } from './repo_data_structure'

export interface ServiceDeploymentTargets {
  application: string   // application name
  services: { 
    module: string      // module name
    name: string        // service name, '*' for entire module
    version: string     // version number, '*' for latest one
  }[],
  hosts: string[]       // host names, if empty means to automatically find one
  version: string       // target version, '*' for latest one of the application
}

export class RepositoryDeployment extends RepositoryLifeCycle {
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
      return await this.db!.get('resource', resourceIdentity)
    } else {
      return await this.db!.set('resource', resourceInfo)
    }
  }

  public async createOrUpdateRuntimeOfServices(targets: ServiceDeploymentTargets, token: string) {
    await this.validateShoalUser(token)
    console.log('create or update runtime of services:', targets)
    // const hosts = targets.hosts
    const application = targets.application
    const services = targets.services 
    const version = targets.version

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
    return serviceList
  }
}