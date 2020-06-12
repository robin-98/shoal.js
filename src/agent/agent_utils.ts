import { Sardines } from 'sardines-core'
import { getRepositoryEntiryAddressesFromDeployPlan } from '../deployer'

export const getRepositoryShoalUser = (repoDeployPlan: Sardines.DeployPlan): {name: string, password: string}|null => {
  let account: {name: string, password: string} | null = null
  if (repoDeployPlan && repoDeployPlan.applications && repoDeployPlan.applications.length) {
    repoDeployPlan.applications.forEach(item => {
      if (item.name === 'sardines' && item.init && item.init.length) {
        item.init.forEach(initItem => {
          if (initItem.service
            && initItem.service.module === '/repository'
            && initItem.service.name === 'setup'
            && initItem.arguments && initItem.arguments.length) {
            if (initItem.arguments[0].shoalUser && initItem.arguments[0].shoalUser.name && initItem.arguments[0].shoalUser.password) {
              account = {
                name: initItem.arguments[0].shoalUser.name,
                password: initItem.arguments[0].shoalUser.password
              }
            }
          }
        })
      }
    })
  }
  return account
}

export const genSardinesConfigForAgent = (repoDeployPlan: Sardines.DeployPlan): Sardines.Config|null => {
  let config: Sardines.Config|null = null
  if (!repoDeployPlan) return config
  let repoEntryAddresses = getRepositoryEntiryAddressesFromDeployPlan(repoDeployPlan)
  let driversCache: {[key: string]: string[]} = {} 
  repoEntryAddresses.forEach(item => {
    let driverName :string = ''
    if (typeof item.driver === 'object') {
      driverName = item.driver[Sardines.Platform.nodejs]
    } else if (typeof item.driver === 'string') {
      driverName = item.driver
    }
    if (driverName && !driversCache[driverName]) driversCache[driverName] = [item.protocol]
    else if (driverName && driversCache[driverName].indexOf(item.protocol) < 0) {
      driversCache[driverName].push(item.protocol)
    }
  })
  let shoalUser = getRepositoryShoalUser(repoDeployPlan)
  if (shoalUser && repoEntryAddresses && repoEntryAddresses.length) {
    config = {
      application: 'sardines-shoal-agent',
      platform: Sardines.Platform.nodejs,
      repositoryEntries: repoEntryAddresses.map(item => ({providerInfo: item, user: shoalUser!.name, password: shoalUser!.password})),
      drivers: Object.keys(driversCache).map(item => ({
        name: item, 
        locationType: Sardines.LocationType.npm,
        protocols: driversCache[item]
      }))
    }
  }
  return config
}