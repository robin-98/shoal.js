import * as origin from './index.sardine'
import { RepositorySettings } from './class'
import { Account } from './class'
import { Application } from './class'
import { Service } from './class'
export { RepositorySettings } from './class'
export const setup = async (settings: RepositorySettings) => {
   return await origin.setup(settings)
}
export const signIn = async (account: Account, password: string) => {
   return await origin.signIn(account, password)
}
export const signOut = async (token: string) => {
   return await origin.signOut(token)
}
export const signUp = async (account: Account, password: string) => {
   return await origin.signUp(account, password)
}
export const createOrUpdateApplication = async (application: Application, token: string) => {
   return await origin.createOrUpdateApplication(application, token)
}
export const queryApplication = async (application: Application|{id: string}, token: string) => {
   return await origin.queryApplication(application, token)
}
export const deleteApplication = async (application: Application, token: string) => {
   return await origin.deleteApplication(application, token)
}
export const queryService = async (service: Service, token: string) => {
   return await origin.queryService(service, token)
}
export const createOrUpdateService = async (service: Service, token: string) => {
   return await origin.createOrUpdateService(service, token)
}
export const deleteService = async (service: Service, token: string) => {
   return await origin.deleteService(service, token)
}
