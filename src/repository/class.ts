/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:41
 * @modify date 2019-06-13 15:42:41
 * @desc [description]
 */
import { RepositoryBase } from './base'
import * as utils from 'sardines-utils'

import {
    Account,
    Service,
    Source,
    Application
} from './base'

export class Repository extends RepositoryBase {
    constructor() {
        super()
    }

    // Application
    private async checkAppPrivilege(appIdentity: Application, token: string, account: Account) {
        if (!account.can_create_application) {
            throw utils.unifyErrMesg('Do not have privileges on creating or updating any application', 'repository', 'application')
        }
        let appInst: Application = await this.queryApplication(appIdentity, token)
        if (appInst && appInst.owner !== account.id && account.id !== this.owner!.id) {
            throw utils.unifyErrMesg('Do not have privilege to update this application', 'repository', 'application')
        }
        return appInst
    }

    async createOrUpdateApplication(application: Application, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        const appInst = await this.checkAppPrivilege(application, token, account)
        if (appInst) {
            return await this.db!.set('application', application, {id: appInst.id})
        } else {
            return await this.db!.set('application', application)
        }
    }

    async deleteApplication(application: Application, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        const appInst = await this.checkAppPrivilege(application, token, account)
        if (appInst) {
            return await this.db!.set('application', null, {id: appInst.id})
        } else {
            throw utils.unifyErrMesg('Application does not exist', 'repository', 'application')
        }
    }

    async queryApplication(application: Application|{id: string}, token: string) {
        await this.validateToken(token, true)
        return await this.db!.get('application', application)
    }

    // Service
    private async checkServicePrivilege(service: Service, token: string, account: Account) {
        if (!account.can_create_service) {
            throw utils.unifyErrMesg('Do not have privileges on creating or updating any service', 'repository', 'service')
        }
        let serviceInst: Service = await this.queryService(service, token)
        if (serviceInst) {
            let appIdentity: Application|null = null
            if (serviceInst.application_id) appIdentity = {id: serviceInst.application_id}
            else if (service.application) appIdentity = {name: serviceInst.application}
            if (!appIdentity) throw utils.unifyErrMesg('Application setting is missing', 'repository', 'service')
            let appInst: Application = await this.queryApplication(appIdentity, token)
            if (!appInst) {
                throw utils.unifyErrMesg('Invalid application setting', 'repository', 'service')
            } else if (account.id && account.id !== this.owner!.id
                && account.id !== appInst.owner && account.id !== serviceInst.owner
                && appInst.developers && appInst.developers.indexOf(account.id) < 0
                && serviceInst.developers && serviceInst.developers.indexOf(account.id)<0 ) {
                throw utils.unifyErrMesg('Do not have privilege to update this service', 'repository', 'service')
            }
        }
        return serviceInst
    }

    async createOrUpdateService(service: Service, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        let serviceInst = await this.checkServicePrivilege(service, token, account)
        if (serviceInst) {
            return await this.db!.set('service', service, {id: serviceInst.id})
        } else if (service.application || service.application_id) {
            let appIdentity: Application = {}
            if (service.application_id) appIdentity.id = service.application_id
            else if (service.application) appIdentity.name = service.application
            let appInst = await this.queryApplication(appIdentity, token)
            if (!appInst && account.can_create_application && !service.application_id) {
                appInst = await this.createOrUpdateApplication(appIdentity, token)
            } else if (!appInst && !account.can_create_application) {
                throw utils.unifyErrMesg('Do not have privilege to create application', 'repository', 'service')
            } else if (!appInst && service.application_id) {
                throw utils.unifyErrMesg('Invalid application id', 'repository', 'service')
            }
            serviceInst = Object.assign({application_id: appInst.id}, service)
            return await this.db!.set('service', serviceInst)
        } else {
            throw utils.unifyErrMesg('Can not create service without application setting', 'repository', 'service')
        }
    }

    async queryService(service: Service, token: string): Promise<Service> {
        await this.validateToken(token, true)
        let serviceInst = await this.db!.get('service', service)
        if (serviceInst) {
            // Fetch foreign keys
        }
        return serviceInst
    }

    async deleteService(service: Service, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        const serviceInst = await this.checkServicePrivilege(service, token, account)
        if (serviceInst) {
            return await this.db!.set('service', null, {id: serviceInst.id})
        } else {
            throw utils.unifyErrMesg('Service does not exist', 'repository', 'service')
        }
    }
    
    // Source
    async checkSourcePrivilege(source: Source, token: string, account: Account): Promise<Source|null> {
        let sourceInst = await this.querySource(source, token)
        if (!account) return null
        else return sourceInst
    }

    async querySource(source: Source, token: string): Promise<Source|null> {
        await this.validateToken(token, true)
        return await this.db!.get('source', source)
    }

    async createOrUpdateSource(source: Source, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        let sourceInst = await this.checkSourcePrivilege(source, token, account)
        if (sourceInst) {
            return await this.db!.set('source', source, {id: sourceInst.id})
        } else {
            return await this.db!.set('source', source)
        }
    }

    async deleteSource(source: Source, token: string) {
        
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        let sourceInst: Source|null = await this.checkSourcePrivilege(source, token, account)
        if (sourceInst) {
            return await this.db!.set('source', null, {id: sourceInst.id})
        } else {
            throw utils.unifyErrMesg('Source does not exist', 'repository', 'source')
        }
    }
}

