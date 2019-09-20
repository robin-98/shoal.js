/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-09-20 11:59:05
 * @modify date 2019-09-20 11:59:05
 * @desc [description]
 */

import { RepositoryDeployment } from './repo_deploy'
import { SystemLoad } from '../interfaces/system_load'

const calcWorkload = (sysload: SystemLoad):number => {
  let load = 100
  load -= sysload.cpu.idle
  return Math.round(load)
}

export class RepositoryRuntime extends RepositoryDeployment {
  constructor() {
    super()
  }

  public async resourceHeartbeat(sysload: SystemLoad, token:string) {
    let tokenObj = await this.validateToken(token, true)
    if (!this.shoalUser || !this.shoalUser.id 
      || !tokenObj || !tokenObj.account_id || tokenObj.account_id !== this.shoalUser.id) {
      throw 'Unauthorized user'
    }

    const resourcePerf = await this.db!.set('resource_performance', sysload)
    if (resourcePerf) {
      if (sysload.resource_id) {
        await this.db!.set('resource', {workload_percentage: calcWorkload(sysload)}, {id: sysload.resource_id})
      }
      return 'OK'
    }
    return null
  }

}