/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-08-05 10:00:22
 * @modify date 2019-08-05 10:00:22
 * @desc [description]
 */

import { RepositoryLifeCycle, Service } from './repo_lifecycle'
import { utils, Sardines } from 'sardines-core'



export const workloadThreshold = 85
export const retryLimit = 3
export const deploymentFailureLimitInSeconds = 300
export const defaultLoadBalancingStrategy = Sardines.Runtime.LoadBalancingStrategy.workloadFocusing


export interface  RuntimeQueryObject {
  name?: string
  type?: Sardines.Runtime.ResourceType
  account?: string
  service_id?: string
  status?: Sardines.Runtime.RuntimeStatus
  workload_percentage?: string
}

export class RepositoryDeployment extends RepositoryLifeCycle {
  constructor() {
    super()
  }

  protected async findAvailableRuntime(type:Sardines.Runtime.RuntimeTargetType, target: Service|Sardines.Runtime.Resource, strategy: Sardines.Runtime.LoadBalancingStrategy = defaultLoadBalancingStrategy) {
    let { runtimeObj, table } = this.getRuntimeQueryObj(type, target)
    runtimeObj.status = Sardines.Runtime.RuntimeStatus.ready
    runtimeObj.workload_percentage = `lt:${workloadThreshold}`
    const orderby = { workload_percentage: strategy === Sardines.Runtime.LoadBalancingStrategy.workloadFocusing ? -1 : 1}
    let runtimeInst = await this.db!.get(table, runtimeObj, orderby, 1)
    return runtimeInst
  }

  private genDeployJobTicket(length: number = 80) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/'
    let result = ''
    for (let i = 0; i<length; i++) {
      result += alphabet[Math.round(Math.random()*(alphabet.length-1))]
    }
    return `${result}${Date.now()}`
  }

  private getRuntimeQueryObj(type: Sardines.Runtime.RuntimeTargetType, target: Service|Sardines.Runtime.Resource) {
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

  protected async raceToDeploy(type: Sardines.Runtime.RuntimeTargetType,  target: Service|Sardines.Runtime.Resource, retry: number = 0 ): Promise<{permission: boolean, runtime: any}|null> {
    // Create a deployment job, race a ticket
    let deploy_job_ticket = this.genDeployJobTicket()

    let { runtimeObj, table } = this.getRuntimeQueryObj(type, target)
    runtimeObj.status = Sardines.Runtime.RuntimeStatus.deploying
    
    try {
      await this.db!.set(table, Object.assign({}, runtimeObj, {deploy_job_ticket}))
    } catch (e) { }

    let permission = false, workingDeployment = null
    try {
      const query = Object.assign({}, runtimeObj, {
        create_on: `gt:${Date.now() - deploymentFailureLimitInSeconds*1000}`
      })
      let runtimeInst = await this.db!.get(table, query, {create_on: 1}, 1)
      workingDeployment = runtimeInst
      if (!workingDeployment) {
        // could not happen if database is OK
        if (retry < retryLimit) {
          return await this.raceToDeploy(type, target, retry + 1)
        } else {
          return null
        }
      }
      permission = (workingDeployment.deploy_job_ticket === deploy_job_ticket)
    } catch (e) { }

    if (!permission && workingDeployment) {
      // Drop self
      try {
        await this.db!.set(table, null, Object.assign({}, runtimeObj, {deploy_job_ticket}))
      } catch (e) {}
    } 
    if (workingDeployment) {
      return { permission, runtime: workingDeployment }
    }
    return null
  }

  async fetchServiceRuntime(serviceIdentity: Sardines.ServiceIdentity|Sardines.ServiceIdentity[], token: string, bypassToken: boolean = false): Promise<any> {
    if (!serviceIdentity || !token) return null
    if (!bypassToken) await this.validateToken(token, true)
    if (Array.isArray(serviceIdentity)) {
      let res = []
      for (let i=0; i<serviceIdentity.length; i++) {
        let resItem: Sardines.Runtime.Service|null = await this.fetchServiceRuntime(serviceIdentity, token, bypassToken=true)
        res.push(resItem)
      }
      return res
    } else {
      let service = await this.queryService(serviceIdentity, token, bypassToken = true)
      if (service) {
        let runtime = await this.findAvailableRuntime(Sardines.Runtime.RuntimeTargetType.service, service)
        if (!runtime) {
          // notify someone to deploy one instance
          runtime = await this.deployService(service)
          // 
        }
      }
    }
    return null
  }

  protected async deployService(service: Service) {
    const race = await this.raceToDeploy(Sardines.Runtime.RuntimeTargetType.service, service)
    if (!race) {
      // Database is broken
      return null
    } else if (race.permission) {
      // deploy the service
    }
    // wait for the deployment job done

    // return the deployed runtime
    return race.runtime
  }

  async deployResource(resourceData: any, token:string) {
    if (!resourceData) throw utils.unifyErrMesg('invalid host data', 'sardines', 'repository')
    await this.validateToken(token, true)
    // parse host data
    let resource:any = {}
    if (resourceData.name) resource.name = resourceData.name
    if (resourceData.address) {
      for (let key of ['ipv4', 'port', 'ipv6']) {
        if (!resource.address) resource.address = {}
        resource.address[key] = resourceData.address[key]
      }
      if (resource.address && resource.address.port && !resource.address.ipv4) {
        throw utils.unifyErrMesg('invalid resource data, ipv4 address is missing', 'sardines', 'repository')
      }
    }
    if (resourceData.tags && Array.isArray(resourceData.tags)) resource.tags = resourceData.tags
    if (!resource.name && resource.address) {
      if (resource.address.ipv4) {
        resource.name = resource.ipv4
        if (resource.address.port) resource.name += ':' + resource.address.port
      } else if (resource.address.ipv6) {
        resource.name = resource.ipv6
      }
    }
    if (!resource.name) throw utils.unifyErrMesg('invalid resource data', 'sardines', 'repository')
    resource.account = resourceData.account || 'sardines'
    resource.type = resourceData.type || Sardines.Runtime.ResourceType.host

    // Race to deploy the resource
    let resourceRuntimeObj: Sardines.Runtime.Resource = {name: resource.name, account: resource.account, type: resource.type}

    // Check if resource exists
    let resourceInst = await this.db!.get('resource', Object.assign({}, resourceRuntimeObj, {status: Sardines.Runtime.RuntimeStatus.ready}), null, 1)
    if (resourceInst) return null

    let race = await this.raceToDeploy(Sardines.Runtime.RuntimeTargetType.host, resourceRuntimeObj)
    if (!race) {
      return null
    } else if (race.permission) {
      const res = await this.deployAgentOnResource(race.runtime)
      console.log('deployment response:', res)
    }
    return race.runtime
  }

  protected async deployAgentOnResource(resourceInst: any) {
    console.log('going to deploy agent on resource:', resourceInst)
  }

  public async createOrUpdateResourceInfo(resourceInfo: Sardines.Runtime.Resource, token: string) {
    let tokenObj = await this.validateToken(token, true)
    if (!this.shoalUser || !this.shoalUser.id 
      || !tokenObj || !tokenObj.account_id || tokenObj.account_id !== this.shoalUser.id) {
      throw 'Unauthorized user'
    }
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
}