/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-08-05 10:00:22
 * @modify date 2019-08-05 10:00:22
 * @desc [description]
 */

 import { Repository } from './repo_class'
 import { Sardines } from 'sardines-core'

 export class RuntimeRepository extends Repository {
   constructor() {
     super()
   }

   async fetchServiceRuntime(serviceIdentity: Sardines.ServiceIdentity|Sardines.ServiceIdentity[], token: string, bypassToken: boolean = false): Promise<any> {
    if (!bypassToken) await this.validateToken(token, true)
    // let tokenObj = await this.validateToken(token, true)
    // let account: Account = await this.queryAccount({id: tokenObj.account_id})
    if (Array.isArray(serviceIdentity)) {
      let res = []
      for (let i=0; i<serviceIdentity.length; i++) {
        let resItem: Sardines.ServiceRuntime|null = await this.fetchServiceRuntime(serviceIdentity, token, bypassToken=true)
        res.push(resItem)
      }
      return res
    } else {
      let service = await this.queryService(serviceIdentity, token, bypassToken = true)
      if (service) {
        let runtime = await this.db!.get('service_runtime', {id: service.id!})
        if (!runtime) {

        }
      }
    }
    return null
   }
 }