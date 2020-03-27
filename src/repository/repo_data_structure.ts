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
    PostgresTempleteAccount,
    Account as TempleteAccount,
    PostgresServerSettings
} from 'sardines-built-in-services'
import { utils } from 'sardines-core'
// import * as semver from 'semver'

export const extraPostgresDBStruct: PostgresDatabaseStructure = {
    account: {
        can_create_application: 'Boolean NOT NULL DEFAULT true',
        can_create_service: 'Boolean NOT NULL DEFAULT true',
        can_manage_repository: 'Boolean NOT NULL DEFAULT false'
    },
    application: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        name: 'VARCHAR(100) UNIQUE',
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
        application_id: 'UUID', // can only be null for sardines repository services
        application: 'VARCHAR(100)',
        module: 'VARCHAR(300)',
        name: 'VARCHAR(100)',
        version: 'VARCHAR(20)',
        source_id: 'UUID',
        arguments: [{
            name: 'VARCHAR(50)',
            type: 'VARCHAR(100)'
        }],
        return_type: 'VARCHAR(100)',
        is_async: 'BOOLEAN',
        file_path: 'VARCHAR(100)',
        UNIQUE: ['application', 'module', 'name', 'version']
    },
    source: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        type: 'VARCHAR(30)',
        URL: 'VARCHAR(300)',
        root: 'VARCHAR(100) DEFAULT \'/\''
    },
    service_runtime: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        application_id: 'UUID', // can only be null for sardines repository services
        application: 'VARCHAR(100)',
        module: 'VARCHAR(300)',
        name: 'VARCHAR(100)',
        version: 'VARCHAR(20)', // can only be '*' for sardines repository services
        tags: 'VARCHAR(100)[]',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        deploy_job_ticket: 'VARCHAR(100)',
        status: 'VARCHAR(30)',
        last_active_on: 'TIMESTAMP(3)',
        resource_id: 'UUID',    // can only be null for sardines repository services
        threads: 'SMALLINT DEFAULT 1',
        expire_in_seconds: 'INT DEFAULT 900',
        workload_percentage: 'SMALLINT DEFAULT 100',     // when service is ready, it will update this value by itself to open for serving requests
        service_id: 'UUID', // can only be null for sardines repository services
        entry_type: 'VARCHAR(20)',
        provider_raw: 'JSONB',
        provider_name: 'VARCHAR(100)',
        provider_info: 'JSONB',
        settings_for_provider: 'JSONB',
        init_params: 'JSONB',   // service used init parameters
    },
    resource: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        deploy_job_ticket: 'VARCHAR(100)',
        status: 'VARCHAR(30)',
        workload_percentage: 'SMALLINT DEFAULT 100',    // when resource is ready, it will update this value by itself to open for serving requests
        name: 'VARCHAR(200) NOT NULL',
        account: 'VARCHAR(50)',
        type: 'VARCHAR(100) NOT NULL',
        tags: 'VARCHAR(50)[]',
        address: {
            ipv4: 'VARCHAR(15)',
            ssh_port: 'INT',
            ipv6: 'VARCHAR(60)'
        },
        providers: 'JSONB',
        running_apps: 'INT DEFAULT 0',
        running_services: 'INT DEFAULT 0',
        cpu_cores: 'SMALLINT',
        mem_megabytes: 'INT',
        last_active_on: 'TIMESTAMP(3)',
        UNIQUE: ['type', 'name', 'account']
    },
    resource_performance: {
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        resource_id: 'UUID NOT NULL',
        cpu: { 
            count: 'SMALLINT',
            load: 'NUMERIC(3,1)',
            usr: 'NUMERIC(3,1)',
            sys: 'NUMERIC(3,1)',
            idle: 'NUMERIC(3,1)',
            irq: 'NUMERIC(3,1)',
            count_change: 'SMALLINT'
        },
        mem: {
            total: 'INT',
            free: 'INT',
            used: 'INT',
            active: 'INT',
            swaptotal: 'INT',
            swapused: 'INT',
            swapfree: 'INT',
            mem_change: 'INT',
            swap_change: 'INT' 
        },
        proc: {
            all_processes: 'SMALLINT',
            running: 'SMALLINT',
            blocked: 'SMALLINT',
            sleeping: 'SMALLINT',
            all_change: 'SMALLINT' 
        },
        maxCpuProc: { 
            name: 'VARCHAR(30)',
            cpu: 'NUMERIC(6,1)',
            mem: 'NUMERIC(6,1)'
        },
        maxMemProc: { 
            name: 'VARCHAR(30)',
            cpu: 'NUMERIC(6,1)',
            mem: 'NUMERIC(6,1)'
        },
        agentProc: { 
            name: 'VARCHAR(30)',
            cpu: 'NUMERIC(6,1)',
            mem: 'NUMERIC(6,1)'
        },
        disk: {
            rx_sec: 'INT',
            wx_sec: 'INT',
            tx_sec: 'INT',
            rIO_sec: 'INT',
            wIO_sec: 'INT',
            tIO_sec: 'INT',
            added_devices_count: 'SMALLINT',
            removed_devices_count: 'SMALLINT',
            added_devices: 'VARCHAR(300)[]',
            removed_devices: 'VARCHAR(300)[]'
        },
        net: {
            totoal_interfaces: 'SMALLINT',
            total_change: 'SMALLINT',
            up_interfaces: 'SMALLINT',
            up_change: 'SMALLINT',
            active_interfaces: 'SMALLINT',
            rx_dropped: 'INT',
            rx_errors: 'INT',
            tx_dropped: 'INT',
            tx_errors: 'INT',
            rx_sec: 'INT',
            tx_sec: 'INT',
        },
        timespan_sec: 'NUMERIC(6,1)',
        checkAt: 'TIMESTAMP(3)',
        name: 'VARCHAR(200)',
        account: 'VARCHAR(50)',
        type: 'VARCHAR(100)'
    }
}

export interface RepositorySettings {
    db: StorageSettings
    fs?: StorageSettings
    owner: Account
    shoalUser?: Account
}

export interface ServiceArgument {
    type: string
    name: string
}

export interface Service {
    id?: string
    application?: string
    application_id?: string
    module: string
    name: string
    arguments?: ServiceArgument[]
    return_type?: string
    is_async?: boolean
    version?: string
    source_id?: string
    is_public?: boolean
    owner?: string
    developers?: string[]
    provider_settings?: any[]
    init_params?: any
    last_access_on?: any
    file_path?: string
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
    owner_id?: string
    developers?: string[]
    last_access_on?: any
}

export enum SourceType {
    git = 'git'
}

export interface Source {
    id?: string
    type?: string
    url?: string
    root?: string
    last_access_on?: any
}


export class RepositoryDataStructure extends PostgresTempleteAccount {
    protected fs: Storage|null = null
    protected owner: Account|null = null
    protected shoalUser: Account|null = null

    constructor() {
        super()
        this.tokenExpireInSeconds = 1800
    }

    public async setup(repoSettings: RepositorySettings) {
        await this.setupDB(<PostgresServerSettings>(repoSettings.db.settings), extraPostgresDBStruct)
        if (repoSettings.fs) {
            this.fs = setupStorage(repoSettings.fs)
        }
        this.owner = repoSettings.owner
        let accountToCreate = [this.owner]
        if (repoSettings.shoalUser) {
            this.shoalUser = repoSettings.shoalUser
            accountToCreate.push(this.shoalUser)
        }
        
        try {
            for (let i = 0; i<accountToCreate.length; i++) {
                let accountInDB = await this.queryAccount(accountToCreate[i])
                if (!accountInDB) {
                    let account = accountToCreate[i]
                    accountInDB = Object.assign({}, account)
                    const extraProps = ['can_login']
                    if (i===0) Array.prototype.push.apply(extraProps, ['can_create_application', 'can_create_service', 'can_manage_repository', 'can_manage_accounts'])
                    for (let prop of extraProps) {
                        accountInDB[prop] = true
                    }
                    accountInDB = await this.createOrUpdateAccount(accountInDB)
                    accountInDB = Object.assign(accountInDB, account)
                    if (i===0) this.owner = accountInDB
                    else this.shoalUser = accountInDB
                } 
                if (accountInDB) {
                    if (i===0) this.owner = accountInDB
                    else this.shoalUser = accountInDB
                }
            }
            
            this.isInited = true
            console.log('repository initialized')
            return this.isInited
        } catch (e) {
            utils.inspectedDebugLog('ERROR when initializing repository:', e)
            throw e
        }
    }

    public async createAccount(username: string, password: string, token:string) {
        let tokenObj = await this.validateToken(token, true)
        if (tokenObj) {
            return await this.signUp({name: username}, password)
        }
        return null
    }

    // Application
    protected async checkAppPrivilege(appIdentity: Application, token: string, account: Account) {
        if (!account.can_create_application) {
            throw utils.unifyErrMesg('Do not have privileges on creating or updating any application', 'repository', 'application')
        }
        let appInst: Application = await this.queryApplication(appIdentity, token)
        if (appInst && appInst.owner_id !== account.id && account.id !== this.owner!.id) {
            throw utils.unifyErrMesg('Do not have privilege to update this application', 'repository', 'application')
        }
        return appInst
    }

    async createOrUpdateApplication(application: Application, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        const appInst = await this.checkAppPrivilege(application, token, account)
        application.last_access_on = Date.now()
        if (appInst) {
            await this.db!.set('application', application, {id: appInst.id})
            return {id: appInst.id}
        } else {
            application.owner_id = account.id
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
    protected async checkServicePrivilege(service: Service, token: string, account: Account) {
        if (!account.can_create_service) {
            throw utils.unifyErrMesg('Do not have privileges on creating or updating any service', 'repository', 'service')
        }
        let serviceQuery: any = {}
        if (service.application_id) serviceQuery.application_id = service.application_id
        if (service.module) serviceQuery.module = service.module
        if (service.name) serviceQuery.name = service.name
        if (service.version) serviceQuery.version = service.version

        let serviceInst: Service|null = <Service|null>await this.queryService(serviceQuery, token)
        if (serviceInst) {
            let appIdentity: Application|null = null
            if (serviceInst.application_id) appIdentity = {id: serviceInst.application_id}
            else if (service.application) appIdentity = {name: serviceInst.application}
            if (!appIdentity) throw utils.unifyErrMesg('Application setting is missing', 'repository', 'service')
            let appInst: Application = await this.queryApplication(appIdentity, token)
            if (!appInst) {
                throw utils.unifyErrMesg('Invalid application setting', 'repository', 'service')
            } else if (account.id && account.id !== this.owner!.id
                && account.id !== appInst.owner_id && account.id !== serviceInst.owner
                && appInst.developers && appInst.developers.indexOf(account.id) < 0
                && serviceInst.developers && serviceInst.developers.indexOf(account.id)<0 ) {
                throw utils.unifyErrMesg('Do not have privilege to update this service', 'repository', 'service')
            }
        }
        return serviceInst
    }

    async createOrUpdateService(serviceArg: Service|Service[], token: string) {
        if (Array.isArray(serviceArg)) {
            let res = []
            for (let i = 0; i<serviceArg.length; i++) {
                let resItem:any = await this.createOrUpdateService(serviceArg[i], token)
                res.push(resItem)
            }
            return res
        } else {
            const service = serviceArg
            let tokenObj = await this.validateToken(token, true)
            let account: Account = await this.queryAccount({id: tokenObj.account_id})
            let serviceInst = await this.checkServicePrivilege(service, token, account)
            service.last_access_on = Date.now()
            if (serviceInst) {
                await this.db!.set('service', service, {id: serviceInst.id})
                return {id: serviceInst.id}
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
                serviceInst = Object.assign({application_id: appInst.id, application: appInst.name}, service)
                return await this.db!.set('service', serviceInst)
            } else {
                throw utils.unifyErrMesg('Can not create service without application setting', 'repository', 'service')
            }
        }
    }

    async queryService(service: Service, token: string, bypassToken: boolean = false, limit: number = 1): Promise<Service|Service[]|null> {
        if (!bypassToken) await this.validateToken(token, true)

        // Compose general query for the application
        let serviceQuery = Object.assign({}, service)
        let appName = serviceQuery.application
        if (appName) delete serviceQuery.application
        if (!serviceQuery.application_id) {
            let appInst = await this.db!.get('application', {name: appName}, {create_on: -1}, 1)
            if (appInst) {
                appName = appInst.name
                serviceQuery.application_id = appInst.id
            } else {
                throw utils.unifyErrMesg('The application which the service claimed belonging to does not exist', 'repository', 'service')
            }
        }
        if (serviceQuery.name === '*') {
            delete serviceQuery.name
        }
        if (serviceQuery.module === '*') {
            delete serviceQuery.module
        }
        let version = serviceQuery.version
        if (!version || version === '*' || version.toLowerCase() === 'latest') {
            // find the latest version number
            delete serviceQuery.version
            let latestVersion = await this.db!.get('service', serviceQuery, {create_on: -1}, 1, 0, ['version', 'create_on'])
            if (latestVersion) {
                version = latestVersion.version
                serviceQuery.version = latestVersion
            } else {
                version = '*'
            }
        }

        // to query entire module
        let queryResult: any = null
        if (serviceQuery.version) {
            queryResult = await this.db!.get('service', serviceQuery, null, limit)
        } else if (serviceQuery.name && serviceQuery.module) {
            let orderby = { create_on: -1 }
            queryResult = await this.db!.get('service', serviceQuery, orderby, 1)
        } else {
            let distinctServiceNames = await this.db!.get('service', serviceQuery, null, 0, 0, ['module', 'name'])
            if (distinctServiceNames) {
                queryResult = []
                if (distinctServiceNames && !Array.isArray(distinctServiceNames)) {
                    distinctServiceNames = [distinctServiceNames]
                }
                for (let i=0; i<distinctServiceNames.length; i++) {
                    const tmpService = distinctServiceNames[i]
                    let orderby = { create_on: -1 }
                    let tmpServiceQuery = Object.assign(tmpService, serviceQuery)
                    let serviceInst = await this.db!.get('service', tmpServiceQuery, orderby, 1)
                    if (serviceInst) {
                        queryResult.push(serviceInst)
                    }
                }
                if (queryResult.length === 0) return null
            }
        }
        if (!queryResult) return null

        // clear useless keys
        if (!Array.isArray(queryResult)) {
            queryResult = [queryResult]
        }
        for(let serviceInst of queryResult) {
            if (serviceInst && serviceInst.is_public) {
                // Fetch foreign keys
                serviceInst.application = appName
                // delete serviceInst.application_id
                delete serviceInst.create_on
                delete serviceInst.last_access_on
                delete serviceInst.owner_id
                delete serviceInst.developers
                // delete serviceInst.is_public
                // delete serviceInst.source_id
                // delete serviceInst.file_path
                // delete serviceInst.provider_settings
                // delete serviceInst.init_params
                // Assemble custom types
                // Decode arguments
                // TODO: move the decode algorithm to postgres class
                if (typeof serviceInst.arguments === 'string') {
                    serviceInst.arguments = serviceInst.arguments.match(/([a-z|A-Z|,]{2,})/g)
                    for (let i = serviceInst.arguments.length - 1; i>=0; i--) {
                        const argStr = serviceInst.arguments[i]
                        const pair = argStr.split(',')
                        serviceInst.arguments[i] = { name: pair[0], type: pair[1] }
                    }
                }
            }
        }
        if (queryResult && queryResult.length === 1) queryResult = queryResult[0]
        return queryResult
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

    async querySource(source: Source, token: string, bypassToken: boolean = false): Promise<Source|null> {
        if (!bypassToken) await this.validateToken(token, true)
        return await this.db!.get('source', source)
    }

    async createOrUpdateSource(source: Source, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        let sourceInst = await this.checkSourcePrivilege(source, token, account)
        source.last_access_on = Date.now()
        if (sourceInst) {
            await this.db!.set('source', source, {id: sourceInst.id})
            return {id: sourceInst.id}
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

