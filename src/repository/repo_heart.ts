import { RepositoryDataStructure } from './repo_data_structure'

export class RepositoryHeart extends RepositoryDataStructure {
  [key:string]: any
  private intervalHeartbeat: any = null
  private heartbeatTimespan: number = 1 * 1000
  private heartbeatCount: number = 0
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
    this.startHeart()
  }

  protected appendJobInHeart(jobName: string, startRound: number = 3600, intervalCounts: number = 3600) {
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
  }
}