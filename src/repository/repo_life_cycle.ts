import { RepositoryRuntime } from './repo_runtime'
export * from './repo_runtime'

export class RepositoryLifeCycle extends RepositoryRuntime {
  private intervalHeartbeat: any = null
  private heartbeatTimespan: number = 600 * 1000
  constructor() {
    super()
    this.startHeartbeat()
  }

  public stopHeartbeat() {
    if (this.intervalHeartbeat) {
      clearInterval(this.intervalHeartbeat)
    }
  }

  private startHeartbeat() {
    this.intervalHeartbeat = setInterval(this.heartbeat.bind(this), this.heartbeatTimespan)
  }

  private async heartbeat() {
    if (this.isInited) {
      try {
        await this.removeOutDatePerfData()
        // console.log('sardines repository heartbeat done')
      } catch (e) {
        console.error(`Error of sardines repository heartbeat:`, e)
      }
    }
  }

  private async removeOutDatePerfData() {
    await this.db!.set('resource_performance', null, {
      create_on: `lt:${Date.now() - 1000 * 60 * 60 * 24}`
    })
  }
}