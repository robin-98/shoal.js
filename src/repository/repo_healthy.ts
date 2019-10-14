import { RepositoryRuntime } from './repo_runtime'

export class RepositoryHealthy extends RepositoryRuntime {
  constructor() {
    super()
    if (typeof this.checkOnlineResoures === 'function') {
      this.appendJobInHeart('checkOnlineResoures', 1, 60)
    }
  }

  protected checkOnlineResoures() {

  }
}