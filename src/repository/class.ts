/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:41
 * @modify date 2019-06-13 15:42:41
 * @desc [description]
 */
import {
    Service,
    Account,
    Application,
    RepositorySettings,
    RepositoryBase,
    Token
} from './base'

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

export class Repository extends RepositoryBase {
    private tokenCache: Map<string, Token>
    constructor() {
        super()
        this.tokenCache = new Map()
    }

    // Account

    private validatePassword(password: string) {
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
            accountInst.password = await cryptPassword(password) 
            accountInst = await this.createOrUpdateAccount(accountInst)
            return accountInst
        }
    }

    private async createToken(accountId: string): Promise<string|null> {
        if (!accountId) return null
        let tokenObj: Token = {
            account_id: accountId,
            token: genToken(30),
            expire_on: Date.now() + 1800000
        }
        let tokenInDb = await this.store.get('token', tokenObj)
        while (tokenInDb) {
            tokenObj.token = genToken(30)
            tokenInDb = await this.store.get('token', tokenObj)
        }
        await this.store.set('token', tokenObj)
        this.tokenCache.set(tokenObj.token, tokenObj)
        return tokenObj.token
    }

    private async validateToken(token: string, update: boolean = false): Promise<Token> {
        if (!token) throw utils.unifyErrMesg('token is empty', 'repository', 'token')
        let tokenObj: Token|null = null
        if (this.tokenCache.has(token)) {
            tokenObj = this.tokenCache.get(token)
        } else {
            tokenObj = await this.store.get('token', {token})
        }
        if (!tokenObj) {
            throw utils.unifyErrMesg('Invalid token', 'repository', 'token')
        } else if (tokenObj.expire_on - Date.now() < 0) {
            throw utils.unifyErrMesg('token expired', 'repository', 'token')
        } else {
            if (update) {
                tokenObj.expire_on = Date.now() + 1800000
                await this.store.set('token', tokenObj)
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
        await this.store.set('token', null, {token})
    }

    // Application
    private async checkAppPrivilege(appIdentity: Application, token: string, account: Account) {
        if (!account.can_create_application) {
            throw utils.unifyErrMesg('Do not have privileges on creating or updating any application', 'repository', 'application')
        }
        let appInst: Application = await this.queryApplication(appIdentity, token)
        if (appInst && appInst.owner !== account.id && account.id !== this.owner.id) {
            throw utils.unifyErrMesg('Do not have privilege to update this application', 'repository', 'application')
        }
        return appInst
    }

    async createOrUpdateApplication(application: Application, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        const appInst = await this.checkAppPrivilege(application, token, account)
        if (appInst) {
            return await this.store.set('application', application, {id: appInst.id})
        } else {
            return await this.store.set('application', application)
        }
    }

    async deleteApplication(application: Application, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        const appInst = await this.checkAppPrivilege(application, token, account)
        if (appInst) {
            return await this.store.set('application', null, {id: appInst.id})
        } else {
            throw utils.unifyErrMesg('Application does not exist', 'repository', 'application')
        }
    }

    async queryApplication(application: Application|{id: string}, token: string) {
        await this.validateToken(token, true)
        return await this.store.get('application', application)
    }

    // Service
    private async checkServicePrivilege(service: Service, token: string, account: Account) {
        if (!account.can_create_service) {
            throw utils.unifyErrMesg('Do not have privileges on creating or updating any service', 'repository', 'service')
        }
        let serviceInst: Service = await this.queryService(service, token)
        if (serviceInst) {
            let appIdentity: Application = null
            if (serviceInst.application_id) appIdentity = {id: serviceInst.application_id}
            else if (service.application) appIdentity = {name: serviceInst.application}
            if (!appIdentity) throw utils.unifyErrMesg('Application setting is missing', 'repository', 'service')
            let appInst: Application = await this.queryApplication(appIdentity, token)
            if (!appInst) {
                throw utils.unifyErrMesg('Invalid application setting', 'repository', 'service')
            } else if (account.id !== this.owner.id && account.id !== appInst.owner && account.id !== serviceInst.owner
                && appInst.developers.indexOf(account.id) < 0 && serviceInst.developers.indexOf(account.id)<0 ) {
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
            return await this.store.set('service', service, {id: serviceInst.id})
        } else if (service.application || service.application_id) {
            let appIdentity: Application = {}
            if (serviceInst.application_id) appIdentity.id = serviceInst.application_id
            else if (serviceInst.application) appIdentity.name = serviceInst.application
            let appInst = await this.queryApplication(appIdentity, token)
            if (!appInst && account.can_create_application && !service.application_id) {
                appInst = await this.createOrUpdateApplication(appIdentity, token)
            } else if (!appInst && !account.can_create_application) {
                throw utils.unifyErrMesg('Do not have privilege to create application', 'repository', 'service')
            } else if (!appInst && service.application_id) {
                throw utils.unifyErrMesg('Invalid application id', 'repository', 'service')
            }
            serviceInst = Object.assign({application_id: appInst.id}, service)
            return await this.store.set('service', serviceInst)
        } else {
            throw utils.unifyErrMesg('Can not create service without application setting', 'repository', 'service')
        }
    }

    async queryService(service: Service, token: string): Promise<Service> {
        await this.validateToken(token, true)
        return await this.store.get('service', service)
    }

    async deleteService(service: Service, token: string) {
        let tokenObj = await this.validateToken(token, true)
        let account: Account = await this.queryAccount({id: tokenObj.account_id})
        const serviceInst = await this.checkServicePrivilege(service, token, account)
        if (serviceInst) {
            return await this.store.set('service', null, {id: serviceInst.id})
        } else {
            throw utils.unifyErrMesg('Service does not exist', 'repository', 'service')
        }
    }
}

