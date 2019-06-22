/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:46
 * @modify date 2019-06-13 15:42:46
 * @desc [description]
 */
import { RepositorySettings } from './base'
export { RepositorySettings } from './base'
import { Repository } from './class'

import {
    Account,
    Service,
    Application
} from './base'

let repoInst: Repository|null = null

export const setup = async (settings: RepositorySettings) => {
    if (repoInst) return
    if (!repoInst) repoInst = new Repository()
    await repoInst.setup(settings)
}

// Account
export const signIn = async (account: Account, password: string): Promise<string> => {
    if (!repoInst) return ''
    return await repoInst.signIn(account, password)
}

export const signOut = async(token: string) => {
    if (!repoInst) return
    return await repoInst.signOut(token)
}

export const signUp = async (account: Account, password: string) => {
    if (!repoInst) return
    return await repoInst.signUp(account, password)
}

// Application
export const createOrUpdateApplication = async (application: Application, token: string) => {
    if (!repoInst) return
    return await repoInst.createOrUpdateApplication(application, token)
}

export const queryApplication = async (application: Application|{id: string}, token: string) => {
    if (!repoInst) return null
    return await repoInst.queryApplication(application, token)
}

export const deleteApplication = async (application: Application, token: string) => {
    if (!repoInst) return
    return await repoInst.deleteApplication(application, token)
}

// Service
export const queryService = async (service: Service, token: string): Promise<Service|null> => {
    if (!repoInst) return null
    return await repoInst.queryService(service, token)
}

export const createOrUpdateService = async (service: Service, token: string): Promise<Service|null> => {
    if (!repoInst) return null
    return await repoInst.createOrUpdateService(service, token)
}

export const deleteService = async (service: Service, token: string) => {
    if (!repoInst) return
    return await repoInst.deleteService(service, token)
}
