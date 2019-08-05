/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:50:46
 * @modify date 2019-06-20 15:50:46
 * @desc provider builder is to start/shutdown a service provider according to its settings
 */
import * as path from 'path'
import * as proc from 'process'

import { utils, Sardines, Factory } from 'sardines-core'
import { Source } from 'sardines-compile-time-tools'

import {
    parseDeployPlanFile,
    getServiceDefinitionsMap
} from './deployer_utils'
import * as fs from 'fs';

const {params} = utils.parseArgs()

const getSourceCodeFilePath = (filepath: string): string => {
    let extname = path.extname(filepath)
    if (extname === '.ts') {
        return `${path.dirname(filepath)}/${path.basename(filepath, extname)}.js`
    }else return filepath
}

export const deploy = async (filepath: string, serviceDefinitions: any[], verbose: boolean = false) => {

    const deployPlan = await parseDeployPlanFile(filepath, verbose)
    if (!serviceDefinitions || !Array.isArray(serviceDefinitions) || !deployPlan.applications || !Array.isArray(deployPlan.applications)) {
        console.error(`No service is setup to deploy`)
        return
    }

    const providerInstances: Map<string, any> = new Map()
    const providerSettingsCache: Map<string, Sardines.ProviderSettings> = new Map()
    for (let providerInfo of deployPlan.providers) {
        // Get provider settings
        let providerClass: any = null, providerName: string|null = null
        if (providerInfo.code && providerInfo.code.name) {
            providerName = providerInfo.code.name
            if (!Factory.getClass(providerName)) {
                providerClass = await Source.getPackageFromNpm(providerName, providerInfo.code.locationType, verbose)
                if (providerClass) {
                    Factory.setClass(providerName, providerClass, 'provider')
                } else {
                    throw utils.unifyErrMesg(`failed to load provider class [${providerName}] from npm package`)
                }
            }
            const providerInst = Factory.getInstance(providerName, providerInfo.providerSettings, 'provider')
            if (!providerInst) {
                throw utils.unifyErrMesg(`failed to instance provider [${providerName}]`, 'deployer', 'provider')
            }
            providerInstances.set(providerName, providerInst)
            if (verbose) {
                console.log(`loaded provider [${providerName}]`)
            }
            providerSettingsCache.set(providerName, providerInfo)
        }
    }
    
    
    const appMap = getServiceDefinitionsMap(serviceDefinitions)
    if (!appMap) {
        throw utils.unifyErrMesg(`Can not parse service definitions`, 'shoal', 'deploy')
    }
    const sourceFiles: Map<string,{[key: string]: any}> = new Map()
    for (let app of deployPlan.applications) {
        let codeBaseDir = null
        if (!app.name || typeof app.name !== 'string') continue
        if (!appMap!.has(app.name)) continue

        const serviceMap = appMap!.get(app.name)
        if (!serviceMap) continue
        if (app.code && app.code.locationType === Sardines.LocationType.file && app.code.location) {
            codeBaseDir = path.resolve(proc.cwd(), app.code.location)
        }
        if (codeBaseDir && fs.existsSync(codeBaseDir)) {
            let keys = serviceMap.keys()
            let i = keys.next()
            while (!i.done) {
                const serviceId = i.value
                let service = serviceMap.get(serviceId)
                if (!service.filepath) {
                    throw utils.unifyErrMesg(`File path is missing: service [${serviceId}]`, 'shoal', 'deploy')
                }
                let serviceCodeFile = getSourceCodeFilePath(path.resolve(codeBaseDir, './' + service.filepath))
                if (!fs.existsSync(serviceCodeFile)) {
                    throw utils.unifyErrMesg(`Can not find source code file for service [${serviceId}] at [${serviceCodeFile}]`, 'shoal', 'deploy')
                }
                if (!sourceFiles.has(serviceCodeFile)) sourceFiles.set(serviceCodeFile, require(serviceCodeFile))
                const handler = sourceFiles!.get(serviceCodeFile)![service.name]
                if (!handler) {
                    throw utils.unifyErrMesg(`Can not get handler from source code file for service [${serviceId}]`, 'shoal', 'deploy')
                }
                // register handler on all provider instances
                let providerNames = providerInstances.keys()
                let name = providerNames.next()
                while (!name.done) {
                    const providerInst = providerInstances.get(name.value)
                    // Get additional settings for the service on the provider
                    let providerSettings = providerSettingsCache.get(name.value)
                    name = providerNames.next()
                    let additionalServiceSettings:any = null

                    if (providerSettings!.applicationSettings && Array.isArray(providerSettings!.applicationSettings)) {
                        for (let appSettingsForProvider of providerSettings!.applicationSettings) {
                            let commonSettings = appSettingsForProvider.commonSettings? Object.assign({}, appSettingsForProvider.commonSettings):{}
                            if (appSettingsForProvider.application === app.name  && appSettingsForProvider.serviceSettings && Array.isArray(appSettingsForProvider.serviceSettings)) {
                                for (let ss of appSettingsForProvider.serviceSettings) {
                                    if ( ss.module === service.module && ss.name === service.name) {
                                        additionalServiceSettings = Object.assign(commonSettings, ss.settings)
                                        break
                                    }
                                }
                                break
                            }
                        }
                    }
                    // register service on the provider instance
                    try {
                        await providerInst.registerService(service, handler, additionalServiceSettings)
                        if (verbose) {
                            console.log(`service [${serviceId}] has been registered`)
                        }
                    } catch (e) {
                        if (verbose) console.error(`ERROR when registering service [${serviceId}]`, e)
                        throw utils.unifyErrMesg(`Can not register service [${serviceId}]`, 'shoal', 'deploy')
                    }
                }
                i = keys.next()
            }

            if (app.init && app.init.length > 0) {
                for (let serviceRuntime of app.init) {
                    let service = serviceMap.get(serviceRuntime.service)
                    let sourceCodeFile = getSourceCodeFilePath(path.resolve(codeBaseDir, './' + service.filepath))
                    if (fs.existsSync(sourceCodeFile)) {
                        let handler = require(sourceCodeFile)[service.name]
                        if (serviceRuntime.arguments) {
                            const res = await handler(...serviceRuntime.arguments)
                            return res
                        }
                    }
                }
            }
        }
    }
    return null
}

export const exec = async (serviceDefinitions: any) => {
    if (params['definition-file']) {
        params.definition_file = params['definition-file']
    }
    if (params['deploy-plan-file']) {
        params.deploy_plan_file = params['deploy-plan-file']
        let serviceDefs:any = serviceDefinitions
        if (params.definition_file && fs.existsSync(params.definition_file)) {
            try {
                serviceDefs = JSON.parse(fs.readFileSync(params.definition_file, {encoding: 'utf8'}))
            } catch (e) {
                console.error(`ERROR when parsing service definition file [${params.definition_file}]`)
                throw e
            }
        }
        return await deploy(params.deploy_plan_file, serviceDefs, params.verbose)
    }
}
