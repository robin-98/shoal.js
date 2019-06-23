/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:36:37
 * @modify date 2019-06-13 15:36:37
 * @desc [description]
 */
import { setupStorage, StorageSettings, PostgresDatabaseStructure, Storage } from 'sardines-built-in-services'
import * as utils from 'sardines-utils'
import * as bcrypt from 'bcrypt';

const cryptPassword = async (password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) reject(err)
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) reject(err)
                else resolve(hash)
            });
        });
    })
};

const comparePassword = (plainPass:string, hashword:string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainPass, hashword, function(err, isPasswordMatch) {
            if (err) reject(err)
            else resolve(isPasswordMatch)
        })
    })
};

const tokenAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const genToken = (length: number) => {
    let token = ''
    for (let i = 0; i<length; i++) {
        token += tokenAlphabet[Math.round(Math.random()*(tokenAlphabet.length - 1))]
    }
    return token
}

export const postgresDBStruct: PostgresDatabaseStructure = {
    account: {
        id: 'UUID PRIMARY KEY DEFAULT uuid_generate_v4()',
        create_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        last_access_on: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
        name: 'VARCHAR(30) UNIQUE NOT NULL',
        password: 'VARCHAR(64) NOT NULL',
        password_expire_on: 'TIMESTAMP(3)',
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
    },
    token: {
        account_id: 'UUID',
        token: 'VARCHAR(100) UNIQUE NOT NULL',
        expire_on: 'TIMESTAMP(3)'
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

export interface Account {
    id?: string
    name?: string
    email?: string
    mobile?: string
    can_login?: boolean
    can_create_application?: boolean
    can_create_service?: boolean
    can_manage_repository?: boolean
    can_manage_accounts?: boolean
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

export interface Token {
    account_id: string
    token: string
    expire_on?: number
}


export class RepositoryBase {
    protected db: Storage|null = null
    protected fs: Storage|null = null
    protected owner: Account|null = null
    protected isInited: boolean = false
    protected tokenCache: Map<string, Token>

    constructor() {
        this.tokenCache = new Map()
    }

    public async setup(repoSettings: RepositorySettings) {
        this.db = setupStorage(repoSettings.db, postgresDBStruct)
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
            let objId: {id: string|null}= {id: null}
            if (typeof obj === 'string') {
                objId.id = obj
            } else if (typeof obj === 'object' && obj && obj.id) {
                objId.id = obj.id
            }
            if (objId.id) {
                try {
                    await this.db!.set(tableName, {last_access_on: 'CURRENT_TIMESTAMP'}, objId)
                } catch (e) {
                    if (e) return 
                }
            }
        }
    }

    protected async queryAccount(account: Account) {
        let accountForQuery: Account = Object.assign({}, account)
        if (accountForQuery.password) delete accountForQuery.password
        return await this.db!.get('account', accountForQuery)
    }

    protected async createOrUpdateAccount(account: Account) {
        if (account.password) account.password = await cryptPassword(account.password) 
        if (!account.id) return await this.db!.set('account', account)
        else return this.db!.set('account', account, {id: account.id})
    }

    // Account

    protected validatePassword(password: string) {
        if (!password) {
            throw utils.unifyErrMesg('Password can not be empty', 'repository', 'account')
        } else if (password.length < 6) {
            throw utils.unifyErrMesg('Password shall be longer than 6', 'repository', 'account')
        }
    }

    async signUp(account: Account, password: string) {
        // Validate account and password
        this.validatePassword(password)

        // Check whether account exists
        let accountInst = await this.queryAccount(account)
        if (account) {
            throw utils.unifyErrMesg('Account already exists', 'repository', 'account')
        } else {
            accountInst = account
            accountInst = await this.createOrUpdateAccount(accountInst)
            return accountInst
        }
    }

    protected async createToken(accountId: string): Promise<string> {
        let tokenQuery = {
            account_id: accountId,
            token: genToken(30)
        }
        let tokenInDb = await this.db!.get('token', tokenQuery)
        console.log('account_id:', tokenQuery.account_id, 'token:', tokenQuery.token, 'indb:', tokenInDb)
        while (tokenInDb) {
            tokenQuery.token = genToken(30)
            tokenInDb = await this.db!.get('token', tokenQuery)
            console.log('account_id:', tokenQuery.account_id, 'token:', tokenQuery.token, 'indb:', tokenInDb)
        }
        let tokenObj: Token = tokenQuery
        tokenObj.expire_on = Date.now() + 1800000
        await this.db!.set('token', tokenObj)
        this.tokenCache.set(tokenObj.token, tokenObj)
        return tokenObj.token
    }

    protected async validateToken(token: string, update: boolean = false): Promise<Token> {
        if (!token) throw utils.unifyErrMesg('token is empty', 'repository', 'token')
        let tokenObj: Token|null = null
        if (this.tokenCache.has(token)) {
            tokenObj = this.tokenCache.get(token)!
        } else {
            tokenObj = await this.db!.get('token', {token})
        }
        if (!tokenObj) {
            throw utils.unifyErrMesg('Invalid token', 'repository', 'token')
        } else if (tokenObj.expire_on && tokenObj.expire_on - Date.now() < 0) {
            throw utils.unifyErrMesg('token expired', 'repository', 'token')
        } else {
            if (update) {
                tokenObj.expire_on = Date.now() + 1800000
                await this.db!.set('token', tokenObj)
                this.tokenCache.set(token, tokenObj)
            }
            return tokenObj
        }
    }

    async signIn(account: Account, password: string): Promise<string> {
        this.validatePassword(password)
        let accountInst = await this.queryAccount(account)
        if (accountInst) {
            if (await comparePassword(password, accountInst.password)) {
                // Get token
                let token = await this.createToken(accountInst.id)
                return token
            } else {
                throw utils.unifyErrMesg('Password is invalid', 'repository', 'account')
            }
        } else {
            throw utils.unifyErrMesg('Account does not exist', 'repository', 'account')
        }
    }

    async signOut(token: string) {
        await this.validateToken(token)
        if (this.tokenCache.has(token)) {
            this.tokenCache.delete(token)
        } 
        await this.db!.set('token', null, {token})
    }
}

