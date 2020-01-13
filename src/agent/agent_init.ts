import { RepositoryClient, Sardines } from 'sardines-core'
import { getCurrentLoad } from './host_perf'
import { AgentState } from '../interfaces'

export interface Resource extends Sardines.Runtime.Resource { }

export class SardinesAgentInit {

  public agentState: AgentState = {
    hasHostStatStarted: false,
    hasHostInfoUpdated: false,
    providers: {},
    hostId: '',
    perf: null,
    heartbeatRounds: 0
  }

  constructor() {

  }

  async startHost(hostInfo: Resource, heartbeatInterval: number = 1000) {
    // Start heartbeat
    const heartbeat = async() => {
      if (!this.agentState.hasHostStatStarted) {
        this.agentState.perf = await getCurrentLoad(hostInfo.name, hostInfo.account)
        this.agentState.hasHostStatStarted = true
        setTimeout(async()=> {
          await heartbeat()
        }, heartbeatInterval)
        return
      }
      const load = await getCurrentLoad(hostInfo.name, hostInfo.account)
      if (this.agentState.hostId && load) {
        this.agentState.heartbeatRounds++
        try {
          load.resource_id = this.agentState.hostId
          const serviceRuntimeList: string[] = []
          for (let pvdrkey in this.agentState.providers) {
            Array.prototype.push.apply(serviceRuntimeList, this.agentState.providers[pvdrkey].serviceRuntimeIds)
          }
          const res = await RepositoryClient.exec('resourceHeartbeat', {load, runtimes: serviceRuntimeList})
          console.log(`[Agent] repo response of heartbeat at <${new Date()}> in round ${this.agentState.heartbeatRounds}:`, res)
        } catch(e) {
          console.log(`[Agent] ERROR of heartbeat at <${new Date()}> in round ${this.agentState.heartbeatRounds}:`, e)
        }
      }

      setTimeout(async ()=>{
        await heartbeat()
      }, heartbeatInterval)
    }
    await heartbeat()

    // Update host/resource infomation/settings
    const updateHostInfo = async() => {
      if (this.agentState.perf && this.agentState.perf.cpu && this.agentState.perf.cpu.count) {
        hostInfo.cpu_cores = this.agentState.perf.cpu.count
      }
      if (this.agentState.perf && this.agentState.perf.mem && this.agentState.perf.mem.total) {
        hostInfo.mem_megabytes = this.agentState.perf.mem.total
      }
      hostInfo.status = Sardines.Runtime.RuntimeStatus.ready
      hostInfo.type = Sardines.Runtime.ResourceType.host

      const tryToUpdateHostInfo = async() => {
        try {

          const res = await RepositoryClient.exec('updateResourceInfo', hostInfo)
          if (res && res.id) {
            this.agentState.hasHostInfoUpdated = true
            this.agentState.hostId = res.id
          }
        } catch(e) {
          console.error('[Agent] ERROR while trying to update host info:', e)
        }
        if (!this.agentState.hasHostInfoUpdated) {
          setTimeout(async() => {
            await tryToUpdateHostInfo()
          }, heartbeatInterval)
        }
      }
      await tryToUpdateHostInfo()
    }
    await updateHostInfo()
  }
}