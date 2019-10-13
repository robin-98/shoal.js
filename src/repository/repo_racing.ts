/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-08-05 10:00:22
 * @modify date 2019-08-05 10:00:22
 * @desc [description]
 */

import { RepositoryRuntime } from './repo_runtime'
import { Sardines, utils } from 'sardines-core'
import { Service } from './repo_data_structure'

export const retryLimit = 3
export const jobTimeoutLimitInSeconds = 300

export class RepositoryRacing extends RepositoryRuntime {
  constructor() {
    super()
  }

  protected genJobTicket(length: number = 80) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/'
    let result = ''
    for (let i = 0; i<length; i++) {
      result += alphabet[Math.round(Math.random()*(alphabet.length-1))]
    }
    return `${result}${Date.now()}`
  }

  protected async racingForJob(type: Sardines.Runtime.RuntimeTargetType,  target: Service|Sardines.Runtime.Resource, retry: number = 0 ): Promise<{permission: boolean, runtime: any}|null> {
    // Create a deployment job, race a ticket
    let deploy_job_ticket = this.genJobTicket()

    let { runtimeObj, table } = this.getRuntimeQueryObj(type, target)
    runtimeObj.status = Sardines.Runtime.RuntimeStatus.deploying
    
    try {
      await this.db!.set(table, Object.assign({}, runtimeObj, {deploy_job_ticket}))
    } catch (e) { }

    let permission = false, workingDeployment = null
    try {
      const query = Object.assign({}, runtimeObj, {
        create_on: `gt:${Date.now() - jobTimeoutLimitInSeconds*1000}`
      })
      let runtimeInst = await this.db!.get(table, query, {create_on: 1}, 1)
      workingDeployment = runtimeInst
      if (!workingDeployment) {
        // could not happen if database is OK
        if (retry < retryLimit) {
          return await this.racingForJob(type, target, retry + 1)
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

    let race = await this.racingForJob(Sardines.Runtime.RuntimeTargetType.host, resourceRuntimeObj)
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

  async deployService(service: any, token:string) {
    await this.validateToken(token, true)
    const race = await this.racingForJob(Sardines.Runtime.RuntimeTargetType.service, service)
    if (!race) {
      // Database is broken
      return null
    } else if (race.permission) {
      // get an available resource first
      // let runtime = await this.findAvailableRuntime(Sardines.Runtime.RuntimeTargetType.host, service)
      // deploy the service
      console.log('going to deploy services')
    }
    // wait for the deployment job done

    // return the deployed runtime
    return race.runtime
  }
}