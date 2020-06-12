/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-12-19 16:29:05
 * @desc [description]
 */

import { RepositoryHeart } from './repo_heart'
import { Sardines, utils, Core } from 'sardines-core'

export class RepositoryConnect extends RepositoryHeart {
  constructor() {
    super()
  }

  // Communicate with agent
  protected async invokeHostAgent(target: {name?: string, account?: string, id?: string}, service: string, data: any): Promise<{res?: any, error?: any}> {

    try {
      if (!target || (!target.name && !target.id && !target.account) 
        || (target.name && !target.account) || (!target.name && target.account)) {
        throw utils.unifyErrMesg(`unsupported target data`, 'repository', 'invoke host agent')
      }
      if (!service) {
        throw utils.unifyErrMesg(`unsupported agent service [${service}]`, 'repository', 'invoke host agent')
      }

      // find out host id for the target
      let hostId: string = ''
      if (target.id) {
        hostId = target.id
      } else {
        hostId = await this.db!.get('resource', {
                                                  name: target.name,
                                                  account: target.account,
                                                  type: Sardines.Runtime.ResourceType.host
                                                }, null, 1, 0, ['id'])
      }
      if (!hostId) {
        throw utils.unifyErrMesg({
                                    message:`can not find target host [name: ${target.name}, account: ${target.account}] in repository`,
                                    tag: 'target_host_not_found'
                                  }, 'repository', 'invoke host agent')
      }
      
      // find out what provider the agent is using
      const rtInst = await this.db!.get('service_runtime', {
        resource_id: hostId,
        application: 'sardines',
        module: '/agent',
        name: service,
        status: Sardines.Runtime.RuntimeStatus.ready
      }, null, 1, 0, ['provider_info', 'settings_for_provider', 'entry_type'])

      const {provider_info, settings_for_provider, entry_type} = rtInst || {}
      if (!provider_info || !entry_type) {
        throw utils.unifyErrMesg(`can not find alive agent on target host [name: ${target.name}, account: ${target.account}, id: ${hostId}]`, 'repository', 'invoke host agent')
      }

      // send deploy plan and service description objects to the host using the particular provider
      const runtime: Sardines.Runtime.Service = {
        identity: {
          application: 'sardines',
          module: '/agent',
          name: service
        },
        entries: [{
          providerInfo: provider_info,
          settingsForProvider: settings_for_provider,
          type: entry_type
        }],
        arguments: [{
          name: 'data',
          type: 'any'
        }]
      }

      const agentResp = await Core.invoke(runtime, data)
      return {res: agentResp}
    } catch (e) {
      return {error: e}
    }
  }

  // access points
  // return the id of registered access point
  public async registerAccessPoint(type: string, address: string, preference: string, token: string): Promise<string> {
    const tokenObj = await this.validateToken(token, true)
    if (!tokenObj || !tokenObj.account_id) throw 'invalid token'

    if (!type || !address || !preference) {
      throw 'Invalid parameters for registering access point'
    }

    try {
      const typeInDb = type.substr(0,50)
      const addressInDb = address.substr(0,200)
      const preferenceInDb = preference.substr(0,200)
      let instanceInDb: any = await this.db!.get('access_point', {
        type: typeInDb,
        address: addressInDb
      })
      if (instanceInDb && instanceInDb.preference !== preferenceInDb) {
        await this.db!.set('access_point', {
          type: typeInDb,
          address: addressInDb,
          preference: preferenceInDb
        }, {
          type: typeInDb,
          address: addressInDb
        })
      } else if (!instanceInDb) {
        instanceInDb = await this.db!.set('access_point', {
          type: typeInDb,
          address: addressInDb,
          preference: preferenceInDb
        })
      }
      return instanceInDb.id
    } catch(e) {
      throw `ERROR while registering access point: ${e}`
    }
  }

  // return the id of removed access point
  public async removeAccessPoint(type: string, address: string, token: string): Promise<string> {
    const tokenObj = await this.validateToken(token, true)
    if (!tokenObj || !tokenObj.account_id) throw 'invalid token'

    if (!type || !address) {
      throw 'Invalid parameters for removing access point'
    }

    try {
      const typeInDb = type.substr(0,50)
      const addressInDb = address.substr(0,200)
      let instanceInDb: any = await this.db!.get('access_point', {
        type: typeInDb,
        address: addressInDb
      })
      if (!instanceInDb) {
        throw 'ERROR while removing access point: the target access point does not exist'
      } else {
        await this.db!.set('access_point', null, {
          type: typeInDb,
          address: addressInDb
        })
        return instanceInDb.id
      }
    } catch(e) {
      throw `ERROR while removing access point: ${e}`
    }
  }

  // return the id list of service runtime which were operated
  public async operateServiceRuntimeInAccessPoint(option: {add?:boolean, remove?:boolean, priority?: number}, arrayOfServiceRuntimeIds: string[], accessPoint: { id?: string, type?: string, address?: string}, token: string): Promise<string[]> {
    const tokenObj = await this.validateToken(token, true)
    if (!tokenObj || !tokenObj.account_id) throw 'invalid token'

    if (!arrayOfServiceRuntimeIds || !Array.isArray(arrayOfServiceRuntimeIds) || !arrayOfServiceRuntimeIds.length) {
      throw 'ERROR while operating service runtime in access point: Invalid array of service runtime IDs'
    }

    if (!accessPoint || (!accessPoint.id && (!accessPoint.address || !accessPoint.type))) {
      throw 'ERROR while operating service runtime in access point: invalid access point identity'
    }

    if (!option || (typeof option.add == 'undefined' && typeof option.remove == 'undefined')) {
      throw 'ERROR while operating service runtime in access point: invalid operation options'
    }

    if (!option.add && !option.remove) {
      throw 'ERROR while operating service runtime in access point: meaningless operation options'
    }
    
    // Query the id of the access point
    let apId: string = ''
    try {
      apId = await this.db!.get('access_point', accessPoint, null, 1, 0, ['id'])
    } catch(e) {
      throw (`ERROR while operating service runtime in access point: error while quring the target access point: ${e}`)
    }
    if (!apId) {
      throw ('ERROR while operating service runtime in access point: target access point does not exist')
    }

    // execute the operatio
    let operatedServiceRuntimeIdList : string[] = []
    try {
      if (option.add) {
        for (let srId of arrayOfServiceRuntimeIds) {
          const serviceRuntimeInDb = await this.db!.get('service_runtime', {id: srId})
          if (!serviceRuntimeInDb) continue
          const instInDb = await this.db!.get('service_runtime_in_access_point', {
            service_runtime_id: srId,
            access_point_id: apId
          })
          if (!instInDb) {
            await this.db!.set('service_runtime_in_access_point', {
              service_runtime_id: srId,
              access_point_id: apId,
              priority: option.priority || 100
            })
          } else if (instInDb && instInDb.priority !== option.priority || 100) {
            await this.db!.set('service_runtime_in_access_point', {
              service_runtime_id: srId,
              access_point_id: apId,
              priority: option.priority || 100
            }, {
              service_runtime_id: srId,
              access_point_id: apId
            })
          }
          operatedServiceRuntimeIdList.push(srId)
        }  
      } else if (option.remove) {
        operatedServiceRuntimeIdList = await this.db!.get('service_runtime_in_access_point', {
          service_runtime_id: arrayOfServiceRuntimeIds,
          access_point_id: apId,
        }, null, -1, 0, ['service_runtime_id'])
        await this.db!.set('service_runtime_in_access_point', null, {
          service_runtime_id: arrayOfServiceRuntimeIds,
          access_point_id: apId,
        })
      }
      return operatedServiceRuntimeIdList
    } catch (e) {
      throw (`ERROR while operating service runtimes in access point: ${e}`)
    }
  }
}