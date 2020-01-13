/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:50:46
 * @modify date 2019-06-20 15:50:46
 * @desc provider builder is to start/shutdown a service provider according to its settings
 */
import * as path from 'path'
import * as proc from 'process'

import { utils, Sardines, Factory, RepositoryClient } from 'sardines-core'
import { Source } from 'sardines-compile-time-tools'

import { getServiceDefinitionsMap } from './deployer_utils'
import * as fs from 'fs';

const {params} = utils.parseArgs()
const localGitRoot = './tmp_sardines_git_root'

const getSourceCodeFilePath = (filepath: string): string => {
    let extname = path.extname(filepath)
    if (extname === '.ts') {
        return `${path.dirname(filepath)}/${path.basename(filepath, extname)}.js`
    }else return filepath
}

// filepath: file path of deploy plan
// serviceDefinitions: array of service definition file content, each for an application or part of an application
// start or get an instance from factory of the provider
// Register services on the specified provider
export const deploy = async (deployPlan: Sardines.DeployPlan, serviceDefinitions: any[], providerCache: Sardines.Runtime.ProviderCache, verbose: boolean = false):Promise<Sardines.Runtime.DeployResult|null> => {
    if (!serviceDefinitions || !Array.isArray(serviceDefinitions) || !deployPlan.applications || !Array.isArray(deployPlan.applications)) {
        console.error(`No service is setup to deploy`)
        return null
    }
    const result: Sardines.Runtime.DeployResult = {
        services: {},
        providers: []
    }
    const providerInstances: Map<string, any> = new Map()
    const providerSettingsCache: Map<string, Sardines.ProviderDefinition> = new Map()
    for (let providerDefinition of deployPlan.providers) {
        // Get provider settings
        let providerClass: any = null, providerName: string = providerDefinition.name
        if (providerDefinition.code && providerName) {
            if (!Factory.getClass(providerName)) {
                providerClass = await Source.getPackageFromNpm(providerName, providerDefinition.code.locationType, verbose)
                if (providerClass) {
                    Factory.setClass(providerName, providerClass, 'provider')
                } else {
                    throw utils.unifyErrMesg(`failed to load provider class [${providerName}] from npm package`)
                }
            }
            const tmpPd = Object.assign({}, providerDefinition)
            if (tmpPd.applicationSettings) {
                for(let appSetting of tmpPd.applicationSettings) {
                    if (appSetting.serviceSettings) delete appSetting.serviceSettings
                }
            }
            result.providers.push(tmpPd)
            let pvdrSettings = Object.assign({}, providerDefinition.providerSettings)
            let fastKey = ''
            if (pvdrSettings.public) {
                fastKey = utils.getKey(pvdrSettings.public)
                delete pvdrSettings.public
            } else {
                fastKey = JSON.stringify(pvdrSettings)
            }
            let providerInst: any = null
            try {
                providerInst = Factory.getInstance(providerName, providerDefinition.providerSettings, 'provider', fastKey)
            } catch (e) {
                console.error('[service deployer] Error while getting provider instance for', providerName, providerDefinition.providerSettings)
            }
            
            if (!providerInst) {
                throw utils.unifyErrMesg(`failed to instant provider [${providerName}]`, 'deployer', 'provider')
            }
            providerInstances.set(providerName, providerInst)
            if (verbose) {
                console.log(`[service deployer] loaded provider [${providerName}] to deploy services`)
            }
            providerSettingsCache.set(providerName, providerDefinition)
        }
    }
    
    const appMap = getServiceDefinitionsMap(serviceDefinitions)
    if (!appMap) {
        throw utils.unifyErrMesg(`Can not parse service definitions`, 'shoal', 'deploy')
    }
    const sourceFiles: Map<string,{[key: string]: any}> = new Map()
    // Begin to deploy applications
    const serviceRuntimeCache: {[key:string]:Sardines.Runtime.Service} = {}
    
    for (let app of deployPlan.applications) {
        let appName = app.name
        let codeBaseDir = null
        if (!app.name || typeof app.name !== 'string') continue
        if (!appMap!.has(app.name)) continue

        // Cache the registered local service
        for (let serviceDef of serviceDefinitions) {
            if (serviceDef.application !== appName) continue
            const cache = Sardines.Transform.fromServiceDescriptionFileToServiceCache(serviceDef, {booleanValue: true, version: app.version})
            RepositoryClient.setLocalServices(cache)
        }

        const serviceMap = appMap!.get(app.name)
        if (!serviceMap) continue

        // prepare the source code
        // for local files
        if (app.code && app.code.locationType === Sardines.LocationType.file && app.code.location) {
            codeBaseDir = path.resolve(proc.cwd(), app.code.location)
        } else if (app.version && app.version !== '*' && app.code 
            && app.code.locationType === Sardines.LocationType.git
            && app.code.location && app.code.url) {
            // for git repository
            const tmpRoot = `${localGitRoot}/`
            const sourceCodeDir = await Source.getSourceFromGit(app.code.url, tmpRoot, {
                                                                    application: appName,
                                                                    version: app.version,
                                                                    initWorkDir: false,
                                                                    verbose: true
                                                                })
            if (sourceCodeDir) codeBaseDir = path.resolve(`${sourceCodeDir}/`, app.code.location)
        } else {
            throw utils.unifyErrMesg(`unsupported source code information, can not deploy services for application [${app.name}]`, 'shoal', 'deployer')
        }

        // Get the application version
        const appVersion = app.version

        // Begin to deploy services
        result.services[appName] = []
        if (codeBaseDir && fs.existsSync(codeBaseDir)) {
            let keys = serviceMap.keys()
            let i = keys.next()
            while (!i.done) {
                const serviceId = i.value
                let service = serviceMap.get(serviceId)!
                console.log(`[service deployer] going to deploy service [${serviceId}]:`, service)
                if (!service.filepath) {
                    throw utils.unifyErrMesg(`File path is missing: service [${serviceId}]`, 'shoal', 'deploy')
                }
                let serviceCodeFile = getSourceCodeFilePath(path.resolve(codeBaseDir, './' + service.filepath))
                if (!fs.existsSync(serviceCodeFile)) {
                    throw utils.unifyErrMesg(`Can not find source code file for service [${serviceId}] at [${serviceCodeFile}]`, 'shoal', 'deploy')
                }
                if (!sourceFiles.has(serviceCodeFile)) {
                    // if (appName !== 'sardines' && require.cache[require.resolve(serviceCodeFile)]) {
                    //     delete require.cache[require.resolve(serviceCodeFile)]
                    // }
                    sourceFiles.set(serviceCodeFile, require(serviceCodeFile))
                }
                const handler = sourceFiles!.get(serviceCodeFile)![service.name]
                if (!handler) {
                    throw utils.unifyErrMesg(`Can not get handler from source code file [${serviceCodeFile}] for service [${serviceId}]`, 'shoal', 'deploy')
                }
                // prepare to register service
                const serviceRuntime: Sardines.Runtime.Service = {
                    identity: {
                        application: appName,
                        module: service.module,
                        name: service.name,
                        version: appVersion
                    },
                    // arguments: service.arguments,
                    // returnType: service.returnType,
                    entries: []
                }
                serviceRuntimeCache[`${appName}:${service.module}:${service.name}:${appVersion}`] = serviceRuntime
                // register handler on all provider instances
                let providerNames = providerInstances.keys()
                let name = providerNames.next()
                while (!name.done) {
                    const providerName = name.value
                    const providerInst = providerInstances.get(providerName)
                    // Get additional settings for the service on the provider
                    let providerSettings = providerSettingsCache.get(providerName)
                    name = providerNames.next()
                    let additionalServiceSettings:any = null

                    // additionalServiceSettings is serviceSettings for provider
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
                        const tmpService = utils.mergeObjects({}, service)
                        tmpService.application = appName
                        tmpService.version = appVersion
                        const serviceInPvdr = await providerInst.registerService(tmpService, handler, additionalServiceSettings)
                        if (verbose) {
                            console.log(`[service deployer] service [${appName}:${serviceId}:${appVersion}] has been registered`)
                        }

                        const providerInfo = providerSettings!.providerSettings.public
                        const pvdrkey = utils.getKey(providerInfo)
                        Sardines.Transform.pushServiceIntoProviderCache(providerCache, pvdrkey, providerInfo, tmpService, serviceInPvdr)
                        // after registeration, service data structure will be changed:
                        // the arguments will have additional properties
                        // such as 'position' property for http provider
                        // so the arguments field shall be included in provider entry of service runtime

                        const providerDefinition = providerSettingsCache.get(providerName)
                        const providerPublicInfo = providerInst.info || providerDefinition!.providerSettings.public

                        const serviceEntry: Sardines.Runtime.ServiceEntry = {
                            // TODO: proxy type provider info
                            type: (providerPublicInfo) ? Sardines.Runtime.ServiceEntryType.dedicated: Sardines.Runtime.ServiceEntryType.proxy,
                            providerName: providerName
                        }
                        if (providerPublicInfo) {
                            // TODO: proxy type provider info
                            serviceEntry.providerInfo = providerPublicInfo
                            if (additionalServiceSettings) {
                                serviceEntry.settingsForProvider = additionalServiceSettings
                            }
                        }
                        serviceRuntime.entries.push(serviceEntry)
                    } catch (e) {
                        if (verbose) console.error(`ERROR when registering service [${serviceId}]`, e)
                        throw utils.unifyErrMesg(`Can not register service [${serviceId}]`, 'shoal', 'deploy')
                    }
                }
                i = keys.next()
                // Service register is done on all providers
                if (serviceRuntime.entries.length > 0) {
                    result.services[appName].push(serviceRuntime)
                } else {
                    const errMsg = `Failed to register service [${appName}:${serviceId}] on all providers`
                    if (verbose) console.error(errMsg)
                    throw utils.unifyErrMesg(errMsg, 'shoal', 'deploy')
                }
            }

            if (app.init && app.init.length > 0) {
                for (let serviceRuntimeSettings of app.init) {
                    let serviceIdStr = ''
                    if (typeof serviceRuntimeSettings.service === 'string') {
                        serviceIdStr = serviceRuntimeSettings.service
                    } else if (serviceRuntimeSettings.service && typeof serviceRuntimeSettings.service === 'object' 
                    && (<{[key:string]:any}>serviceRuntimeSettings.service).name
                    && (<{[key:string]:any}>serviceRuntimeSettings.service).module) {
                        serviceIdStr = `${(<{[key:string]:any}>serviceRuntimeSettings.service).module}/${(<{[key:string]:any}>serviceRuntimeSettings.service).name}`
                    }
                    if (!serviceIdStr) continue
                    let service = serviceMap.get(serviceIdStr)!
                    console.log(`[service deployer] init service [${serviceIdStr}]`, service)
                    let sourceCodeFile = getSourceCodeFilePath(path.resolve(codeBaseDir, './' + service.filepath))
                    if (fs.existsSync(sourceCodeFile)) {
                        if (serviceRuntimeSettings.arguments) {
                            // const handler = require(sourceCodeFile)[service.name]
                            const handler = sourceFiles.get(sourceCodeFile)![service.name]
                            await handler(...serviceRuntimeSettings.arguments)
                            const srInst = serviceRuntimeCache[`${appName}:${service.module}:${service.name}:${appVersion}`]
                            if (srInst) {
                                srInst.arguments = serviceRuntimeSettings.arguments
                            }
                        }
                    }
                }
            }
        }
    }
    // send 'result' to repository as service runtimes
    return result
}


// To test the script function from command line
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
    return null
}
