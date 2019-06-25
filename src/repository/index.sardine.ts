/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:46
 * @modify date 2019-06-13 15:42:46
 * @desc [description]
 */
import { RepositorySettings } from './class'
export { RepositorySettings } from './class'
import { Repository } from './class'

import {
    Account,
    Service,
    Application
} from './class'

import { unifyAsyncHandler, unifyErrMesg } from 'sardines-utils'

let repoInst: Repository|null = null

const errRepoNotSetupYet = unifyErrMesg('Repository is not setup yet', 'repository', 'setup')

export const setup = async (settings: RepositorySettings) => {
    if (repoInst) return
    if (!repoInst) repoInst = new Repository()
    await repoInst.setup(settings)
}

// Account
export const signIn = async (account: Account, password: string): Promise<string> => {
    if (!repoInst) throw errRepoNotSetupYet
    return await unifyAsyncHandler('repository', 'sign in', repoInst.signIn, repoInst)(account, password)
}

export const signOut = async(token: string) => {
    if (!repoInst) throw errRepoNotSetupYet
    return await unifyAsyncHandler('repository', 'sign out', repoInst.signOut, repoInst)(token)
}

export const signUp = async (account: Account, password: string): Promise<string> => {
    if (!repoInst) throw errRepoNotSetupYet
    return await unifyAsyncHandler('repository', 'sign up', repoInst.signUp, repoInst)(account, password)
}

// Application
export const createOrUpdateApplication = async (application: Application, token: string) => {
    if (!repoInst) throw errRepoNotSetupYet
    return await unifyAsyncHandler('repository', 'create or update application', repoInst.createOrUpdateApplication, repoInst)(application, token)
}

export const queryApplication = async (application: Application|{id: string}, token: string) => {
    if (!repoInst) throw errRepoNotSetupYet
    return await unifyAsyncHandler('repository', 'query application', repoInst.queryApplication, repoInst)(application, token)
}

export const deleteApplication = async (application: Application, token: string) => {
    if (!repoInst) throw errRepoNotSetupYet
    return await unifyAsyncHandler('repository', 'delete application', repoInst.deleteApplication, repoInst)(application, token)
}

// Service
export const queryService = async (service: Service, token: string): Promise<Service|null> => {
    if (!repoInst) return null
    return await unifyAsyncHandler('repository', 'query service', repoInst.queryService, repoInst)(service, token)
}

export const createOrUpdateService = async (service: Service, token: string): Promise<Service|null> => {
    if (!repoInst) return null
    return await unifyAsyncHandler('repository', 'create or update service', repoInst.createOrUpdateService, repoInst)(service, token)
}

export const deleteService = async (service: Service, token: string) => {
    if (!repoInst) return
    return await unifyAsyncHandler('repository', 'delete service', repoInst.deleteService, repoInst)(service, token)
}
