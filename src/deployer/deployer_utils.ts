/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-20 11:26:20
 * @modify date 2019-06-20 11:26:20
 * @desc [description]
 */

import * as fs from 'fs'
import * as path from 'path'
import * as utils from 'sardines-utils'
import { npmCmd } from 'sardines-compile-time-tools'

export enum LocationType {
    npm_link = 'npm_link',
    npm_install = 'npm_install',
    file = 'file'
}

export interface LocationSettings {
    name?: string
    locationType: LocationType
    location?: string
}

export interface ServiceSettingsForProvider {
    module: string
    name: string
    settings: any
}

export interface ApplicationSettingsForProvider {
    application: string
    commonSettings: any
    serviceSettings: ServiceSettingsForProvider[]
}

export interface ProviderSettings {
    code: LocationSettings
    providerSettings: any
    applicationSettings: ApplicationSettingsForProvider[]
}

export interface ServiceArgument {
    name: string
    type: string
}

export interface ServiceRuntime {
    service: string
    arguments?: ServiceArgument[]
}

export interface ApplicationSettings {
    name: string
    code: LocationSettings
    init: ServiceRuntime[]
}


export interface DeployPlan {
    providers: ProviderSettings[]
    applications: ApplicationSettings[]
}

export const rmdir = (dir: string) => {
    // recursively process directory
    if (fs.lstatSync(dir).isDirectory()) {
        for(let item of fs.readdirSync(dir)) {
            const subFilePath = path.join(dir, `./${item}`)
            if (fs.lstatSync(subFilePath).isDirectory()) {
                rmdir(subFilePath)
            } else {
                fs.unlinkSync(subFilePath)
            }
        } 
        fs.rmdirSync(dir)
    } else if (fs.lstatSync(dir).isFile()) {
        fs.unlinkSync(dir)
    }
}

export const getPackageFromNpm = async (packName: string, locationType: LocationType, verbose: boolean = false ) =>  {
    try {
        const type = locationType || LocationType.npm_install
        switch (type) {
        case LocationType.npm_install:
            if (verbose) {
                console.log('going to install package:', packName)
            }
            await npmCmd('install', [packName])
            if (verbose) {
                console.log('package:', packName, 'installed')
            }
            break
        case LocationType.npm_link:
            if (verbose) {
                console.log('going to link package:', packName)
            }
            await npmCmd('link', [packName])
            if (verbose) {
                console.log('package:', packName, 'linked')
            }
            break
        case LocationType.file:
            break
        default:
            break
        }
        const packageInst:any = require(packName)
        if (packageInst) return packageInst.default
        else return null
    } catch (e) {
        if (verbose) {
            console.error(`ERROR when importing provider class [${packName}]`)
        }
        throw utils.unifyErrMesg(`Error when importing npm package [${packName}]: ${e}`, 'deployer', 'npm')
    }
}

export const parseDeployPlanFile = async (filepath: string, verbose: boolean = false): Promise<DeployPlan> => {
    if (!fs.existsSync(filepath)) {
        console.error(`Can not access file ${filepath}`)
        throw utils.unifyErrMesg(`Can not access file ${filepath}`, 'deployer', 'settings file')
    }
    let plan: DeployPlan|null = null
    try {
        plan = JSON.parse(fs.readFileSync(filepath).toString())
        if (verbose) console.log(`loaded provider setting file ${filepath}`)
    } catch (e) {
        if (verbose) console.error(`ERROR when reading and parsing provider setting file ${filepath}`, e)
        throw utils.unifyErrMesg(`ERROR when reading and parsing provider setting file ${filepath}: ${e}`, 'deployer', 'settings file')
    }

    return plan!
}

export const getServiceDefinitionsMap = (applications: any[]): Map<string, Map<string, any>>|null => {
    if (!applications && !Array.isArray(applications)) return null
    let appMap: Map<string, Map<string, any>> = new Map()
    for (let servDefs of applications) {
        if (!servDefs.application || typeof servDefs.application !== 'string') continue
        if (!servDefs || !servDefs.services || !Array.isArray(servDefs.services) || servDefs.services.length === 0) continue
        let serviceMap: Map<string, any> = new Map()
        appMap.set(servDefs.application, serviceMap)
        for (let service of servDefs.services) {
            let servId = `${service.module}/${service.name}`
            serviceMap.set(servId, service)
        }
    }
    return appMap
}
