/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-20 11:26:20
 * @modify date 2019-06-20 11:26:20
 * @desc [description]
 */

import * as fs from 'fs'
import * as path from 'path'
import * as npm from 'npm'
import * as utils from 'sardines-utils'

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

export interface ProviderSettings {
    code: LocationSettings
    settings: any
}

export interface ServiceRuntime {
    service: string
    arguments?: any[]
}

export interface ServiceSettings {
    code: LocationSettings
    init: ServiceRuntime[]
}

export interface DeployPlan {
    providers: ProviderSettings[]
    services: ServiceSettings
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
    const npm_load = () => {
        return new Promise((resolve, reject) => {
            npm.load((err, data) => {
                if (err) reject(err)
                else {
                    // console.log('npm load data:', data)
                    resolve(data)
                }
            })
        })
    }
    const npm_command = (npmInst: any, command: string, args: string[]) => {
        return new Promise((resolve, reject) => {
            (<{[key: string]: any}>(npmInst.commands))[command](args, (err:any, data: any) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    }
    try {
        let npmInst = await npm_load()
        const type = locationType || LocationType.npm_install
        switch (type) {
        case LocationType.npm_install:
            if (verbose) {
                console.log('going to install package:', packName)
            }
            await npm_command(npmInst, 'install', [packName])
            if (verbose) {
                console.log('package:', packName, 'installed')
            }
            break
        case LocationType.npm_link:
            if (verbose) {
                console.log('going to link package:', packName)
            }
            await npm_command(npmInst, 'link', [packName])
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

export const getServiceDefinitionsMap = (servDefs: any): Map<string, any>|null => {
    if (!servDefs || !servDefs.services || !Array.isArray(servDefs.services) || servDefs.services.length === 0) return null
    let serviceMap: Map<string, any> = new Map()
    for (let service of servDefs.services) {
        let servId = `${service.module}/${service.name}`
        serviceMap.set(servId, service)
    }
    return serviceMap
}