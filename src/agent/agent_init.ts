import { RepositoryClient, Sardines, utils } from 'sardines-core'
import { getCurrentLoad } from './host_perf'
import { SystemLoad } from '../interfaces/system_load'
import * as deployer from '../deployer'

export interface Resource extends Sardines.Runtime.Resource { }

export interface AgentStat {
  hasHostStatStarted: boolean
  hasHostInfoUpdated: boolean
  providers: Sardines.Runtime.ProviderCache
  hostId: string|null
  perf: SystemLoad|null
}

export const agentStat:AgentStat = {
  hasHostStatStarted: false,
  hasHostInfoUpdated: false,
  providers: {},
  hostId: '',
  perf: null,
}

export interface ServiceDeployPlan {
  deployPlan: Sardines.DeployPlan
  serviceDescObj: Sardines.ServiceDescriptionFile
}



export class SardinesAgentInit {
  constructor() {

  }

  async startHost(hostInfo: Resource, heartbeatInterval: number = 1000) {
    // Start heartbeat
    const heartbeat = async() => {
      if (!agentStat.hasHostStatStarted) {
        agentStat.perf = await getCurrentLoad(hostInfo.name, hostInfo.account)
        agentStat.hasHostStatStarted = true
        setTimeout(async()=> {
          await heartbeat()
        }, heartbeatInterval)
        return
      }
      const load = await getCurrentLoad(hostInfo.name, hostInfo.account)
      if (agentStat.hostId && load) {
        try {
          load.resource_id = agentStat.hostId
          const serviceRuntimeList: string[] = []
          for (let pvdrkey in agentStat.providers) {
            Array.prototype.push.apply(serviceRuntimeList, agentStat.providers[pvdrkey].serviceRuntimeIds)
          }
          const res = await RepositoryClient.exec('resourceHeartbeat', {load, runtimes: serviceRuntimeList})
          console.log('heartbeat res:', res)
        } catch(e) {
          console.log('ERROR while sending load data:', e)
        }
      }

      setTimeout(async ()=>{
        await heartbeat()
      }, heartbeatInterval)
    }
    await heartbeat()

    // Update host/resource infomation/settings
    const updateHostInfo = async() => {
      if (agentStat.perf && agentStat.perf.cpu && agentStat.perf.cpu.count) {
        hostInfo.cpu_cores = agentStat.perf.cpu.count
      }
      if (agentStat.perf && agentStat.perf.mem && agentStat.perf.mem.total) {
        hostInfo.mem_megabytes = agentStat.perf.mem.total
      }
      hostInfo.status = Sardines.Runtime.RuntimeStatus.ready
      hostInfo.type = Sardines.Runtime.ResourceType.host

      const tryToUpdateHostInfo = async() => {
        try {

          const res = await RepositoryClient.exec('updateResourceInfo', hostInfo)
          if (res && res.id) {
            agentStat.hasHostInfoUpdated = true
            agentStat.hostId = res.id
          }
        } catch(e) {
          console.error('ERROR while trying to update host info:', e)
        }
        if (!agentStat.hasHostInfoUpdated) {
          setTimeout(async() => {
            await tryToUpdateHostInfo()
          }, heartbeatInterval)
        }
      }
      await tryToUpdateHostInfo()
    }
    await updateHostInfo()
  }

  async deployService (data: ServiceDeployPlan[]) {
    if (!data || !Array.isArray(data) || !data.length) {
      throw utils.unifyErrMesg(`Invalid service deployment command from repository`, 'agent', 'deploy service')
    }
    let result:any = []
    for (let dp of data) {
      let res: any = await deployer.deployServices(dp.serviceDescObj, dp.deployPlan, agentStat, true)
      result.push(res)
    }
    return result
  }

  async removeServices(data: {applications: string[], modules: string[], services: string[], versions: string[]}) {
    
  }
}