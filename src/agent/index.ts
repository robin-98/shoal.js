import { RepositoryClient } from 'sardines-core'
import { getCurrentLoad } from './host_perf'

export const setupRepositoryEntries = (entries: any[]) => {
  RepositoryClient.setupRepositoryEntries(entries)
}

let hasHostStatStarted = false
export const startHostStat = async (hostId: string, heartbeatInterval: number = 1000) => {
  if (!hasHostStatStarted) {
    await getCurrentLoad(hostId)
    hasHostStatStarted = true
    setTimeout(async()=> {
      await startHostStat(hostId, heartbeatInterval)
    }, heartbeatInterval)
    return
  }
  try {
    const load = await getCurrentLoad(hostId)
    const res = await RepositoryClient.exec('hostHeartbeat', load)
    console.log('res:', res)
  } catch(e) {
    console.log('ERROR while sending load data:', e)
  }

  setTimeout(async ()=>{
    await startHostStat(hostId, heartbeatInterval)
  }, heartbeatInterval)
}


