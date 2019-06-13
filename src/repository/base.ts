/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:36:37
 * @modify date 2019-06-13 15:36:37
 * @desc [description]
 */
import { storage, StorageSettings, PostgresDatabaseStructure  } from 'sardines-built-in-services'
import * as utils from 'sardines-utils'

export const postgresDBStruct: PostgresDatabaseStructure = {
    account: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
        name: 'VARCHAR(30) UNIQUE NOT NULL',
        password: 'VARCHAR(64) NOT NULL',
        password_expire_on: 'TIMESTAMPZ',
        email: 'VARCHAR(100) UNIQUE',
        is_email_varified: 'Boolean NOT NULL DEFAULT false',
        mobile: 'VARCHAR(20) UNIQUE',
        is_mobile_varified: 'Boolean NOT NULL DEFAULT false',
        can_login: 'Boolean NOT NULL DEFAULT true',
        can_create_application: 'Boolean NOT NULL DEFAULT false',
        can_create_service: 'Boolean NOT NULL DEFAULT false',
        can_manage_repository: 'Boolean NOT NULL DEFAULT false',
        can_manage_accounts: 'Boolean NOT NULL DEFAULT false'
    },
    application: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
        name: 'VARCHAR(30) UNIQUE',
        is_public: 'Boolean NOT NULL DEFAULT true',
        owner_id: 'UUID',
        developers: 'UUID[]'
    },
    service: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
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
        create_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP',
        type: 'VARCHAR(30)',
        URL: 'VARCHAR(300)'
    },
    token: {
        account_id: 'UUID UNIQUE NOT NULL',
        token: 'VARCHAR(100)',
        expire_on: 'TIMESTAMPZ'
    }
}

export interface Service {
    id?: string
    application: string
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

export interface Account {
    id?: string
    name: string
    email: string
    mobile: string
    can_login: boolean
    can_create_application: boolean
    can_create_service: boolean
    can_manage_repository: boolean
    can_manage_accounts: boolean
    password?: string
}

export interface Application {
    id?: string
    name?: string
    is_public?: boolean
    owner?: string
    developers?: string[]
}

export interface RepositorySettings {
    storage: StorageSettings
    owner: Account
}

export interface Token {
    account_id: string
    token: string
    expire_on: number
}

export class RepositoryBase {
    protected store: any
    protected owner: Account
    protected isInited: boolean

    constructor() {}

    public async setup(repoSettings: RepositorySettings) {
        this.store = storage.setup(repoSettings.storage, postgresDBStruct)
        this.owner = repoSettings.owner
        let ownerAccount = await this.queryAccount(this.owner)
        if (!ownerAccount) ownerAccount = this.owner
        for (let prop of ['can_login', 'can_create_application', 'can_create_service', 'can_manage_repository', 'can_manage_accounts']) {
            ownerAccount[prop] = true
        }
        try {
            await this.createOrUpdateAccount(ownerAccount)
            this.owner = await this.queryAccount(ownerAccount)
            this.isInited = true
        } catch (e) {
            utils.inspectedDebugLog('ERROR when initializing repository:', e)
        } finally {
            return this.isInited
        }
    }

    protected async touch(tableName: string, obj: any) {
        if (!tableName || !postgresDBStruct[tableName]) return
        if (Array.isArray(obj)) {
            for (let o of obj) {
                await this.touch(tableName, o)
            }
        } else {
            let objId = {id: null}
            if (typeof obj === 'string') {
                objId.id = obj
            } else if (typeof obj === 'object' && obj && obj.id) {
                objId.id = obj.id
            }
            if (objId.id) {
                try {
                    await this.store.set(tableName, {last_access_on: 'CURRENT_TIMESTAMP'}, objId)
                } catch (e) {
                    if (e) return 
                }
            }
        }
    }

    protected async queryAccount(Account: Account|{id: string}) {
        return await this.store.get('account', Account)
    }

    protected async createOrUpdateAccount(Account: Account) {
        return await this.store.set('account', Account)
    }
}

