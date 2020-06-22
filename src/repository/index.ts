/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:46
 * @modify date 2019-06-13 15:42:46
 * @desc [description]
 */

import { RepositorySettings } from './repo_data_structure'
export { RepositorySettings } from './repo_data_structure'

import { RepositoryRacing as Repository } from './repo_racing'

import {
    Account,
    Service,
    Application,
    Source
} from './repo_data_structure'

import { utils } from 'sardines-core'
let { unifyAsyncHandler, unifyErrMesg } = utils

let repoInst: Repository|null = null

const errRepoNotSetupYet = unifyErrMesg('Repository is not setup yet', 'repository', 'setup')

const checkRepoStatus = () => {
    if (!repoInst) throw errRepoNotSetupYet
}

export const setup = async (settings: RepositorySettings) => {
    if (repoInst) return
    if (!repoInst) repoInst = new Repository()
    return await repoInst!.setup(settings)
}

// Account
export const signIn = async (account: Account, password: string): Promise<string> => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'sign in', repoInst!.signIn, repoInst)(account, password)
}

export const signOut = async(token: string) => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'sign out', repoInst!.signOut, repoInst)(token)
}

export const signUp = async (username: string, password: string, token: string): Promise<string> => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'sign up', repoInst!.createAccount, repoInst)(username, password, token)
}

// Application
export const createOrUpdateApplication = async (application: Application, token: string) => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'create or update application', repoInst!.createOrUpdateApplication, repoInst)(application, token)
}

export const queryApplication = async (application: Application|{id: string}, token: string) => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'query application', repoInst!.queryApplication, repoInst)(application, token)
}

export const deleteApplication = async (application: Application, token: string) => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'delete application', repoInst!.deleteApplication, repoInst)(application, token)
}

// Service
export const queryService = async (service: Service, token: string): Promise<Service|null> => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'query service', repoInst!.queryService, repoInst)(service, token)
}

export const createOrUpdateService = async (service: Service, token: string): Promise<Service|null> => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'create or update service', repoInst!.createOrUpdateService, repoInst)(service, token)
}

export const deleteService = async (service: Service, token: string) => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'delete service', repoInst!.deleteService, repoInst)(service, token)
}

// Source
export const querySource = async (source: Source, token: string): Promise<Source|null> => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'query source', repoInst!.querySource, repoInst)(source, token)
}

export const createOrUpdateSource = async (source: Source, token: string): Promise<Source|null> => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'create or update service', repoInst!.createOrUpdateSource, repoInst)(source, token)
}

export const deleteSource = async (source: Source, token: string) => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'delete service', repoInst!.deleteSource, repoInst)(source, token)
}

// Runtime
export const fetchServiceRuntime = async (serviceIdentity: any, token: string) => {
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'fetch service runtime', repoInst!.fetchServiceRuntime, repoInst)(serviceIdentity, token)
}

export const resourceHeartbeat = async(data: any, token: string) => {
    if (!data) throw unifyErrMesg('invalid data', 'repository', 'resourceHeartbeat') 
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'resource heartbeat', repoInst!.resourceHeartbeat, repoInst)(data, token)
}

export const updateResourceInfo = async(data: any, token: string) => {
    if (!data) throw unifyErrMesg('invalid data', 'repository', 'updateResourceInfo')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'update resource info', repoInst!.updateResourceInfo, repoInst)(data, token)
}

export const deployServices = async(data: any, token: string) => {
    if (!data) throw unifyErrMesg(`invalid data ${data}`, 'repository', 'deployService')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'deploy services', repoInst!.deployServices, repoInst)(data, token) 
}

export const uploadServiceDeployResult = async(data: any, token: string) => {
    if (!data) throw unifyErrMesg('invalid data', 'repository', 'uploadServiceDeployResult')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'upload service deployment result', repoInst!.uploadServiceDeployResult, repoInst)(data, token) 
}

export const removeServiceRuntime = async(data: any, token: string) => {
    if (!data) throw unifyErrMesg('invalid data', 'repository', 'removeServiceRuntime')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'remove service runtime on hosts', repoInst!.removeServiceRuntime, repoInst)(data, token) 
}

export const updateHostIPAddress = async(data: any, token: string) => {
    if (!data) throw unifyErrMesg('invalid data', 'repository', 'updateHostIPAddress')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'update host ip address', repoInst!.updateHostIPAddress, repoInst)(data, token) 
}

// access point
export const registerAccessPoint = async(type: string, address: string, preference: string, token: string) => {
    if (!type || !address || !preference) throw unifyErrMesg('invalid parameters', 'repository', 'registerAccessPoint')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'register access point', repoInst!.registerAccessPoint, repoInst)(type, address, preference, token) 
}

export const removeAccessPoint = async(type: string, address: string, token: string) => {
    if (!type || !address) throw unifyErrMesg('invalid parameters', 'repository', 'removeAccessPoint')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'register access point', repoInst!.removeAccessPoint, repoInst)(type, address, token) 
}

export const operateServiceRuntimeInAccessPoint = async(option: {add?:boolean, remove?:boolean, priority?: number}, arrayOfServiceRuntimeIds: string[], accessPoint: { id?: string, type?: string, address?: string}, token: string) => {
    if (!option || !arrayOfServiceRuntimeIds || !accessPoint ) throw unifyErrMesg('invalid parameters', 'repository', 'operateServiceRuntimeInAccessPoint')
    checkRepoStatus()
    return await unifyAsyncHandler('repository', 'register access point', repoInst!.operateServiceRuntimeInAccessPoint, repoInst)(option, arrayOfServiceRuntimeIds, accessPoint, token) 
}
