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
        throw utils.unifyErrMesg(`can not find target host [name: ${target.name}, account: ${target.account}] in repository`, 'repository', 'invoke host agent')
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
        throw utils.unifyErrMesg(`can not find agent on target host [name: ${target.name}, account: ${target.account}]`, 'repository', 'invoke host agent')
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

}