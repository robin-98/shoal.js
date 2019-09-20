/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:46
 * @modify date 2019-06-13 15:42:46
 * @desc [description]
 */

import { RepositorySettings } from './repo_static'
export { RepositorySettings } from './repo_static'

import { RepositoryRuntime as Repository } from './repo_runtime'

import {
    Account,
    Service,
    Application,
    Source
} from './repo_static'

import { utils, Sardines } from 'sardines-core'
let { unifyAsyncHandler, unifyErrMesg } = utils

let repoInst: Repository|null = null

const errRepoNotSetupYet = unifyErrMesg('Repository is not setup yet', 'repository', 'setup')

export const setup = async (settings: RepositorySettings) => {
    if (repoInst) return
    if (!repoInst) repoInst = new Repository()
    return await repoInst.setup(settings)
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

export const signUp = async (username: string, password: string, token: string): Promise<string> => {
    if (!repoInst) throw errRepoNotSetupYet
    return await unifyAsyncHandler('repository', 'sign up', repoInst.createAccount, repoInst)(username, password, token)
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

// Source
export const querySource = async (source: Source, token: string): Promise<Source|null> => {
    if (!repoInst) return null
    return await unifyAsyncHandler('repository', 'query source', repoInst.querySource, repoInst)(source, token)
}

export const createOrUpdateSource = async (source: Source, token: string): Promise<Source|null> => {
    if (!repoInst) return null
    return await unifyAsyncHandler('repository', 'create or update service', repoInst.createOrUpdateSource, repoInst)(source, token)
}

export const deleteSource = async (source: Source, token: string) => {
    if (!repoInst) return
    return await unifyAsyncHandler('repository', 'delete service', repoInst.deleteSource, repoInst)(source, token)
}

// Runtime
export const fetchServiceRuntime = async (serviceIdentity: any, token: string) => {
    if (!repoInst) return
    return await unifyAsyncHandler('repository', 'fetch service runtime', repoInst.fetchServiceRuntime, repoInst)(serviceIdentity, token)
}

export const deployHost = async (data: any, token: string) => {
    if (!data) return null
    data.type = Sardines.Runtime.ResourceType.host
    if (!repoInst) return null
    return await unifyAsyncHandler('repository', 'fetch service runtime', repoInst.deployResource, repoInst)(data, token)
}

export const resourceHeartbeat = async(data: any, token: string) => {
    if (!data) return null
    if (!repoInst) return null
    return await unifyAsyncHandler('repository', 'resource heartbeat', repoInst.resourceHeartbeat, repoInst)(data, token)
}

export const updateResourceInfo = async(data: any, token: string) => {
    if (!data) return null
    if (!repoInst) return null
    return await unifyAsyncHandler('repository', 'update resource info', repoInst.createOrUpdateResourceInfo, repoInst)(data, token)
}
