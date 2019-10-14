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
        await this.db!.set('resource', {workload_percentage: workload, last_active_on: Date.now()}, {id: sysload.resource_id})
        await this.db!.set('service_runtime', {workload_percentage: workload, last_active_on: Date.now()}, {resource_id: sysload.resource_id})
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
}