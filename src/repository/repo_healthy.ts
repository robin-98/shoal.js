import { Sardines } from 'sardines-core'
import { RepositoryRuntime } from './repo_runtime'

export class RepositoryHealthy extends RepositoryRuntime {
  constructor() {
    super()
    if (typeof this.checkOnlineStatus === 'function') {
      this.appendJobInHeart('checkOnlineStatus', 1, 2)
    }
  }

  protected async checkOnlineStatus() {
    for (let table of ['resource', 'service_runtime']) {
      await this.db!.set(table, {
        status: Sardines.Runtime.RuntimeStatus.pending
      }, {
        last_active_on: `lt:${Date.now()-60*1000*3}`,
        status: Sardines.Runtime.RuntimeStatus.ready
      })
    }
  }
}