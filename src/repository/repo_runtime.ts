/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-09-20 11:59:05
 * @modify date 2019-09-20 11:59:05
 * @desc [description]
 */

import { RepositoryDeployment } from './repo_deploy'
import { Sardines } from 'sardines-core'
import { Service } from './repo_data_structure'
import { utils } from 'sardines-core'

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
}