import { utils } from 'sardines-core'
import * as driver_0 from 'sardines-service-driver-http'
import * as driver_source_0 from '../../node_modules/sardines-service-driver-http/lib/index.js'

const getClassFromPackage = (packageName: string) => {
    let pkgcls = null
    switch (packageName) {

        case 'sardines-service-driver-http':
            pkgcls = utils.getDefaultClassFromPackage(driver_0)
            if (!pkgcls) {
              pkgcls = utils.getDefaultClassFromPackage(driver_source_0)
            }
            break

    }
    return pkgcls
}

export const drivers: {[key:string]:any} = {
  "sardines-service-driver-http": getClassFromPackage('sardines-service-driver-http'),
}
import { RepositoryClient } from 'sardines-core'
export const sardinesConfig = {
  "application": "sardines",
  "platform": "nodejs",
  "srcRootDir": "./src",
  "sardinesDir": "sardines",
  "repositoryEntries": [
    {
      "providerInfo": {
        "protocol": "http",
        "host": "localhost",
        "root": "/",
        "port": 8080,
        "driver": "sardines-service-driver-http"
      },
      "user": "sardines-shoal",
      "password": "Sardines@2019"
    }
  ],
  "drivers": [
    {
      "name": "sardines-service-driver-http",
      "locationType": "npm",
      "protocols": [
        "http"
      ]
    }
  ]
}
RepositoryClient.setupRepositoryEntriesBySardinesConfig(sardinesConfig)
RepositoryClient.setupDrivers(drivers)
