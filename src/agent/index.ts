import { RepositoryClient, Sardines, utils } from 'sardines-core'
import { getCurrentLoad } from './host_perf'
import { SystemLoad } from '../interfaces/system_load'

export interface Resource extends Sardines.Runtime.Resource { }

export let hasHostStatStarted = false
export let hostPerf: SystemLoad|null = null
export let hostId: string|null = null
export let providers: any = null

export const startHost = async (hostInfo: Resource, heartbeatInterval: number = 1000) => {
  // Start heartbeat
  const heartbeat = async() => {
    if (!hasHostStatStarted) {
      hostPerf = await getCurrentLoad(hostInfo.name, hostInfo.account)
      hasHostStatStarted = true
      setTimeout(async()=> {
        await heartbeat()
      }, heartbeatInterval)
      return
    }
    const load = await getCurrentLoad(hostInfo.name, hostInfo.account)
    if (hostId && load && providers) {
      try {
        load.resource_id = hostId
        const res = await RepositoryClient.exec('resourceHeartbeat', {load, providers})
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
  let hasHostInfoUpdated = false
  const updateHostInfo = async() => {
    if (hostPerf && hostPerf.cpu && hostPerf.cpu.count) {
      hostInfo.cpu_cores = hostPerf.cpu.count
    }
    if (hostPerf && hostPerf.mem && hostPerf.mem.total) {
      hostInfo.mem_megabytes = hostPerf.mem.total
    }
    hostInfo.status = Sardines.Runtime.RuntimeStatus.ready
    hostInfo.type = Sardines.Runtime.ResourceType.host

    const tryToUpdateHostInfo = async() => {
      try {
        const res = await RepositoryClient.exec('updateResourceInfo', hostInfo)
        if (res && res.id) {
          hasHostInfoUpdated = true
          hostId = res.id
          providers = res.providers.filter((p:any)=>p&&p.providerSettings&&p.providerSettings.public).map((p:any)=>(p.providerSettings.public))
        }
      } catch(e) {
        utils.debugLog('ERROR while trying to update host info:', e)
      }
      if (!hasHostInfoUpdated) {
        setTimeout(async() => {
          await tryToUpdateHostInfo()
        }, heartbeatInterval)
      }
    }
    await tryToUpdateHostInfo()
  }
  await updateHostInfo()
}

export interface ServiceDeployPlan {
  deployPlan: Sardines.DeployPlan
  serviceDescObj: Sardines.ServiceDescriptionFile
}

export const deployService = async(data: ServiceDeployPlan[]) => {
  console.log('received request from repository to deploy services')
  utils.inspectedLog(data)
  return 'agent received request for deploying services'
}
