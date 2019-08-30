/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-20 11:26:20
 * @modify date 2019-06-20 11:26:20
 * @desc [description]
 */

import * as fs from 'fs'
import * as path from 'path'
import { utils, Sardines } from 'sardines-core'

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


export const parseDeployPlanFile = async (filepath: string, verbose: boolean = false): Promise<Sardines.DeployPlan> => {
    if (!fs.existsSync(filepath)) {
        console.error(`Can not access file ${filepath}`)
        throw utils.unifyErrMesg(`Can not access file ${filepath}`, 'deployer', 'settings file')
    }
    let plan: Sardines.DeployPlan|null = null
    try {
        plan = JSON.parse(fs.readFileSync(filepath).toString())
        if (verbose) console.log(`loaded provider setting file ${filepath}`)
    } catch (e) {
        if (verbose) console.error(`ERROR when reading and parsing provider setting file ${filepath}`, e)
        throw utils.unifyErrMesg(`ERROR when reading and parsing provider setting file ${filepath}: ${e}`, 'deployer', 'settings file')
    }

    return plan!
}

export const getServiceDefinitionsMap = (applications: any[]): Map<string, Map<string, Sardines.Service>>|null => {
    if (!applications && !Array.isArray(applications)) return null
    let appMap: Map<string, Map<string, Sardines.Service>> = new Map()
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

export const getRepositoryEntiryAddressesFromDeployPlan = (deployPlan: Sardines.DeployPlan): Sardines.ProviderPublicInfo[] => {
    let providers: Sardines.ProviderPublicInfo[] = []
    if (deployPlan && deployPlan.providers) {
        for (let provider of deployPlan.providers) {
            if (provider.providerSettings && provider.providerSettings.public && provider.code && provider.code.name) {
                providers.push(provider.providerSettings.public)
            }
        }
    }
    return providers
}

