import { RepositoryDataStructure } from './repo_data_structure'
import { Sardines } from 'sardines-core'
import { SystemLoad } from '../interfaces/system_load'
const calcWorkload = (sysload: SystemLoad):number => {
  let load = 100
  load -= sysload.cpu.idle
  return Math.round(load)
}
export class RepositoryHeart extends RepositoryDataStructure {
  [key:string]: any
  private intervalHeartbeat: any = null
  protected heartbeatTimespan: number = 60 * 1000 // 1 minutes
  protected heartbeatCount: number = 0
  protected jobsInHeart: {[name: string]:{ 
    name: string 
    intervalCounts: number 
    startRound: number
  }} = {}
  constructor() {
    super()
    if (typeof this.removeOutDatePerfData === 'function') {
      this.appendJobInHeart('removeOutDatePerfData')
    }
    if (typeof this.checkPendingServices === 'function') {
      this.appendJobInHeart('checkPendingServices', 0, 2)
    }
    this.startHeart()
  }

  protected appendJobInHeart(jobName: string, startRound: number = 10, intervalCounts: number = 60) {
    if (jobName && !this.jobsInHeart[jobName] && typeof this[jobName] === 'function') {
      this.jobsInHeart[jobName] = {
        name: jobName,
        intervalCounts: intervalCounts <= 0 ? 1 : intervalCounts,
        startRound: startRound <=0 ? 1 : startRound
      }
    }
  }

  public stopHeart() {
    if (this.intervalHeartbeat) {
      clearInterval(this.intervalHeartbeat)
    }
  }

  private startHeart() {
    this.intervalHeartbeat = setInterval(this.heart.bind(this), this.heartbeatTimespan)
  }

  private async heart() {
    if (this.isInited) {
      this.heartbeatCount++
      for (let jobName of Object.keys(this.jobsInHeart)) {
        if (!this[jobName] || typeof this[jobName] !== 'function') continue
        const job = this.jobsInHeart[jobName]
        if (this.heartbeatCount !== job.startRound && (this.heartbeatCount-job.startRound) % job.intervalCounts !== 0) continue
        try {
          const begin = Date.now()
          await this[jobName].apply(this)
          const end = Date.now()
          console.log(`sardines repository job [${jobName}] done in No.${this.heartbeatCount} heartbeat in ${end-begin}ms`)
        } catch (e) {
          console.error(`Error of sardines repository heartbeat:`, e)
        }
      }
    }
  }

  private async removeOutDatePerfData() {
    await this.db!.set('resource_performance', null, {
      create_on: `lt:${Date.now() - 1000 * 60 * 60 * 24}`
    })
    await this.db!.set('token', null, {
      expire_on: `lt:${Date.now()}`
    })
  }

  public async resourceHeartbeat(data: {load: SystemLoad, runtimes: string[]}, token:string) {
    let sysload = data.load
    let tokenObj = await this.validateToken(token, true)
    if (!this.shoalUser || !this.shoalUser.id 
      || !tokenObj || !tokenObj.account_id || tokenObj.account_id !== this.shoalUser.id) {
      throw 'Unauthorized user'
    }

    const resourcePerf = await this.db!.set('resource_performance', sysload)
    if (resourcePerf) {
      if (sysload.resource_id) {
        const workload = calcWorkload(sysload)
        const newStatus = {
          workload_percentage: workload,
          status: Sardines.Runtime.RuntimeStatus.ready,
          last_active_on: Date.now()
        }
        await this.db!.set('resource', newStatus, {id: sysload.resource_id})

        if (data.runtimes && Array.isArray(data.runtimes) && data.runtimes.length) {
          await this.db!.set('service_runtime', newStatus, {id: data.runtimes})
        }
      }
      return 'OK'
    }
    return null
  }

  private async checkPendingServices() {
    try {
      let resourcelist = await this.db!.get('resource', {
        status: Sardines.Runtime.RuntimeStatus.ready
      }, null, 0)
      if (!resourcelist) return 
      if (resourcelist && !Array.isArray(resourcelist)) resourcelist = [resourcelist]
      const self = this
      for (let resource of resourcelist) {
        setTimeout(async() => {
          if (typeof self['reloadPendingServices'] === 'function') {
            await self.reloadPendingServices(resource)
          }
        }, 0)
      }
    } catch (e) {
      console.error(`Error while checking pending services:`, e)
    }
  }
}