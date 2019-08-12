/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-08-05 10:00:22
 * @modify date 2019-08-05 10:00:22
 * @desc [description]
 */

import { RepositoryStatic, Service } from './repo_static'
import { Sardines } from 'sardines-core'
import { utils } from 'sardines-core'

export enum LoadBalancingStrategy {
  workloadFocusing = 'workloadFocusing',
  evenWorkload = 'evenWorkload',
  random = 'random'
}

export const workloadThreshold = 85
export const retryLimit = 3
export const deploymentFailureLimitInSeconds = 300
export const defaultLoadBalancingStrategy = LoadBalancingStrategy.workloadFocusing

export enum RuntimeStatus {
  ready = 'ready',
  pending = 'pending',
  deploying = 'deploying'
}

export enum ResourceType {
  host = 'host'
}

export enum RuntimeTargetType {
  service = 'service',
  host = 'host',
}

export interface  RuntimeQueryObject {
  name?: string
  type?: ResourceType
  account?: string
  service_id?: string
  status?: RuntimeStatus
  workload_percentage?: string
}

export interface Resource {
  name: string
  account: string
  tags?: string[]
  type?: ResourceType
  address?: {
    ipv4?: string
    port?: number
    ipv6?: string
  }
}

export class RepositoryRuntime extends RepositoryStatic {
  constructor() {
    super()
  }

  protected async findAvailableRuntime(type:RuntimeTargetType, target: Service|Resource, strategy: LoadBalancingStrategy = defaultLoadBalancingStrategy) {
    let { runtimeObj, table } = this.getRuntimeQueryObj(type, target)
    runtimeObj.status = RuntimeStatus.ready
    runtimeObj.workload_percentage = `lt:${workloadThreshold}`
    const orderby = { workload_percentage: strategy === LoadBalancingStrategy.workloadFocusing ? -1 : 1}
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

  private getRuntimeQueryObj(type: RuntimeTargetType, target: Service|Resource) {
    let runtimeObj: RuntimeQueryObject|null = null, table = null
    switch (type) {
      case RuntimeTargetType.service:
        runtimeObj = {
          service_id: (<Service>target).id,
        }
        table = 'service_runtime'
        break
      case RuntimeTargetType.host: default: 
        runtimeObj = {
          name: (<Resource>target).name,
          type: (<Resource>target).type,
          account: (<Resource>target).account,
        }
        table = 'resource'
        break
    }
    return { runtimeObj, table }
  }

  protected async raceToDeploy(type: RuntimeTargetType,  target: Service|Resource, retry: number = 0 ): Promise<{permission: boolean, runtime: any}|null> {
    // Create a deployment job, race a ticket
    let deploy_job_ticket = this.genDeployJobTicket()

    let { runtimeObj, table } = this.getRuntimeQueryObj(type, target)
    runtimeObj.status = RuntimeStatus.deploying
    
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
        let resItem: Sardines.ServiceRuntime|null = await this.fetchServiceRuntime(serviceIdentity, token, bypassToken=true)
        res.push(resItem)
      }
      return res
    } else {
      let service = await this.queryService(serviceIdentity, token, bypassToken = true)
      if (service) {
        let runtime = await this.findAvailableRuntime(RuntimeTargetType.service, service)
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
    const race = await this.raceToDeploy(RuntimeTargetType.service, service)
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
    resource.type = resourceData.type || ResourceType.host

    // Race to deploy the resource
    let resourceRuntimeObj: Resource = {name: resource.name, account: resource.account, type: resource.type}

    // Check if resource exists
    let resourceInst = await this.db!.get('resource', Object.assign({}, resourceRuntimeObj, {status: RuntimeStatus.ready}), null, 1)
    if (resourceInst) return null

    let race = await this.raceToDeploy(RuntimeTargetType.host, resourceRuntimeObj)
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

}