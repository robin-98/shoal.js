/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:50:46
 * @modify date 2019-06-20 15:50:46
 * @desc provider builder is to start/shutdown a service provider according to its settings
 */
import * as utils from 'sardines-utils'
import * as path from 'path'
import * as proc from 'process'

import { 
    getPackageFromNpm,
    parseDeployPlanFile,
    LocationType,
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

export const deploy = async (filepath: string, serviceDefinitions: any, verbose: boolean = false) => {

    const deployPlan = await parseDeployPlanFile(filepath, verbose)

    const providerInstances: Map<string, any> = new Map()
    for (let providerInfo of deployPlan.providers) {
        // Get provider settings
        let providerClass: any = null, providerName: string|null = null
        if (providerInfo.code && providerInfo.code.name) {
            providerName = providerInfo.code.name
            if (!utils.Factory.getClass(providerName)) {
                providerClass = await getPackageFromNpm(providerName, providerInfo.code.locationType, verbose)
                if (providerClass) {
                    utils.Factory.setClass(providerName, providerClass, 'provider')
                } else {
                    throw utils.unifyErrMesg(`failed to load provider class [${providerName}] from npm package`)
                }
            }
            const providerInst = utils.Factory.getInstance(providerName, providerInfo.settings, 'provider')
            if (!providerInst) {
                throw utils.unifyErrMesg(`failed to instance provider [${providerName}]`, 'deployer', 'provider')
            }
            providerInstances.set(providerName, providerInst)
            if (verbose) {
                console.log(`loaded provider [${providerName}]`)
            }
        }
    }
    
    if (!serviceDefinitions || !deployPlan.services) return

    let codeBaseDir = null
    if (deployPlan.services.code && deployPlan.services.code.locationType === LocationType.file && deployPlan.services.code.location) {
        codeBaseDir = path.resolve(proc.cwd(), deployPlan.services.code.location)
    }
    if (codeBaseDir && fs.existsSync(codeBaseDir)) {
        const serviceMap = getServiceDefinitionsMap(serviceDefinitions)
        if (!serviceMap) return
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
            const handler = require(serviceCodeFile)[service.name]
            if (!handler) {
                throw utils.unifyErrMesg(`Can not get handler from source code file for service [${serviceId}]`, 'shoal', 'deploy')
            }
            // register handler on all provider instances
            let providerNames = providerInstances.keys()
            let name = providerNames.next()
            while (!name.done) {
                const providerInst = providerInstances.get(name.value)
                name = providerNames.next()
                try {
                    // TODO: move the service settings into provider
                    await providerInst.registerService({
                        path: serviceId,
                        inputParameters: service.arguments,
                        handler,
                        response: {
                            type: service.returnType
                        }
                    })
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

        if (deployPlan.services.init && deployPlan.services.init.length > 0) {
            for (let serviceRuntime of deployPlan.services.init) {
                let service = serviceMap.get(serviceRuntime.service)
                let sourceCodeFile = getSourceCodeFilePath(path.resolve(codeBaseDir, './' + service.filepath))
                if (fs.existsSync(sourceCodeFile)) {
                    let handler = require(sourceCodeFile)[service.name]
                    if (serviceRuntime.parameters) {
                        const res = await handler(...serviceRuntime.parameters)
                        return res
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
