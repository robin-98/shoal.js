export const drivers: {[key:string]:any} = {
  "sardines-service-driver-http": require('sardines-service-driver-http'),
}
for (let d in drivers) {
  if (drivers[d] && drivers[d].default) {
     drivers[d] = drivers[d].default
  }
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
        "host": "192.168.1.5",
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
