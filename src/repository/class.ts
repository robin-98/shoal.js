/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:36:37
 * @modify date 2019-06-13 15:36:37
 * @desc [description]
 */
import {
    setupStorage,
    StorageSettings,
    PostgresDatabaseStructure,
    Storage,
    PostgresTemplete,
    Account as TempleteAccount,
    PostgresServerSettings
} from 'sardines-built-in-services'
import * as utils from 'sardines-utils'

export const extraPostgresDBStruct: PostgresDatabaseStructure = {
    account: {
        can_create_application: 'Boolean NOT NULL DEFAULT false',
        can_create_service: 'Boolean NOT NULL DEFAULT false',
        can_manage_repository: 'Boolean NOT NULL DEFAULT false'
    },
    application: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        name: 'VARCHAR(30) UNIQUE',
        is_public: 'Boolean NOT NULL DEFAULT true',
        owner_id: 'UUID',
        developers: 'UUID[]'
    },
    service: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        owner_id: 'UUID',
        developers: 'UUID[]',
        is_public: 'Boolean NOT NULL DEFAULT true',
        application_id: 'UUID',
        module: 'VARCHAR(300)',
        name: 'VARCHAR(30)',
        version: 'VARCHAR(20)',
        source_id: 'UUID',
        provider_settings: 'JSONB', // Array, enlist all possible provider/driver pairs and provider settings
        init_params: 'JSONB',   // service used init parameters
        UNIQUE: ['application_id', 'name', 'version']
    },
    source: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        type: 'VARCHAR(30)',
        URL: 'VARCHAR(300)'
    }
}

export interface RepositorySettings {
    db: StorageSettings
    fs: StorageSettings
    owner: Account
}

export interface Service {
    id?: string
    application?: string
    application_id?: string
    module: string
    name: string
    version?: string
    source?: string
    is_public?: boolean
    owner?: string
    developers?: string[]
    provider_settings?: any[]
    init_params?: any
}

export interface Account extends TempleteAccount {
    can_create_application?: boolean
    can_create_service?: boolean
    can_manage_repository?: boolean
    password?: string
}

export interface Application {
    id?: string
    name?: string
    is_public?: boolean
    owner?: string
    developers?: string[]
}

export enum SourceType {
    git = 'git'
}

export interface Source {
    id?: string
    type: string
    URL: string
    name: string
}


export class Repository extends PostgresTemplete {
    protected fs: Storage|null = null
    protected owner: Account|null = null

    constructor() {
        super()
    }

    public async setup(repoSettings: RepositorySettings) {
        await this.setupDB(<PostgresServerSettings>(repoSettings.db.settings), extraPostgresDBStruct)
        if (repoSettings.fs) {
            this.fs = setupStorage(repoSettings.fs)
        }
        this.owner = repoSettings.owner
        let ownerAccount = await this.queryAccount(this.owner)
        if (!ownerAccount) ownerAccount = this.owner
        for (let prop of ['can_login', 'can_create_application', 'can_create_service', 'can_manage_repository', 'can_manage_accounts']) {
            ownerAccount[prop] = true
        }
        try {
            let ownerInDB = await this.queryAccount(ownerAccount)
            if (!ownerInDB) {
                ownerInDB = await this.createOrUpdateAccount(ownerAccount)
                ownerInDB = Object.assign(ownerInDB, ownerAccount)
            }
            this.owner = ownerInDB
            this.isInited = true
        } catch (e) {
            utils.inspectedDebugLog('ERROR when initializing repository:', e)
            throw e
        } finally {
            return this.isInited
        }
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

