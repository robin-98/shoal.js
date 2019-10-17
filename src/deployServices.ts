/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:55
 * @modify date 2019-06-13 15:42:55
 * @desc [description]
 */

import * as serviceDeployer from './deployer/service_deployer'
import { utils, Sardines } from 'sardines-core'
import * as path from 'path'
import * as proc from 'process'
import * as fs from 'fs'
import { RepositoryClient } from 'sardines-core'
import * as agent from './agent'
import { parseDeployPlanFile } from './deployer/deployer_utils'

// setup repository client
const sardinesConfigFilepath = path.resolve(proc.cwd(), './sardines-config.json')
if (fs.existsSync(sardinesConfigFilepath)) {
    console.log('loading sardines config:', sardinesConfigFilepath)
    const sardinesConfig = require(sardinesConfigFilepath)
    if (!sardinesConfig.sardinesDir) {
        throw `invalid sardines config file, sardinesDir property is missing`
    }
    require(`./${sardinesConfig.sardinesDir}`)
    RepositoryClient.setupRepositoryEntriesBySardinesConfig(sardinesConfig, true)
}

export interface DeployJobResult {
    deployPlanFile: string
    res: Sardines.Runtime.DeployResult
}
const sendDeployResultToRepository = async(deployResult: Sardines.Runtime.DeployResult|null|undefined) => {
    if (!deployResult) {
        throw 'invalid deploy result of services'
    }

    // wait for agent to get host id
    while (!agent.hasHostStatStarted || !agent.hostId) {
        await utils.sleep(100)
    }

    // if config file exists it will be used 
    // to setup repo_client module automatically
    // no worry about using repo_client module

    // wrap hostId
    const data :any = {
        resourceId: agent.hostId,
        deployResult,
    }

    // use repo_client to send service runtimes to its self
    let res = await RepositoryClient.exec('updateServiceRuntime', data)

    return res

    // or just invoke repository method from memory
    // it's also OK to use repository instance from inside
    // because at this time, the repository instance has been initialized
    // and database is also ready
    // but firstly, need to login using shoalUser
    // it's duplicated process with repo_client, so don't use inside invocation
}

export const deployServices = async (targetServices: any, deployPlan: any, send: boolean = true) => {
    if (!targetServices) {
        throw utils.unifyErrMesg('services are not correctly compiled', 'shoal', 'start')
    }
    const deployRes = await serviceDeployer.deploy(deployPlan, [targetServices], true)
    let repoRes = null
    if (send) {
        repoRes = await sendDeployResultToRepository(deployRes)
    }
    return {deployResult: deployRes, repositoryResponse: repoRes}
}

export const deployServicesByFiles = async (serviceDefinitionFile: string, serviceDeployPlanFile: string, send: boolean = true) => {
    const serviceFilePath = path.resolve(proc.cwd(), serviceDefinitionFile)
    if (fs.existsSync(serviceFilePath)) {
        const targetServices = JSON.parse(fs.readFileSync(serviceFilePath).toString())
        const deployPlan = parseDeployPlanFile(path.resolve(proc.cwd(), serviceDeployPlanFile))
        const res = await deployServices(targetServices, deployPlan, send)
        if (res) return res
        else throw 'deploy failed'
    } else {
        throw `can not access service description file [${serviceFilePath}]`
    }
}

const {files} = utils.parseArgs()
if (files && files.length >= 2 && files.length % 2 === 0) {
    const jobs = async() => {
        const serviceRuntimeQueue: DeployJobResult[] = []
        for (let i = 0; i<files.length; i+=2) {
            const serviceDefinitionFile = files[i]
            const serviceDeployPlanFile = files[i+1]
            try {
                const {deployResult} = await deployServicesByFiles(serviceDefinitionFile, serviceDeployPlanFile, false)
                if (!deployResult) {
                    throw `can not deploy service in file [${serviceDeployPlanFile}]`
                } else {
                    serviceRuntimeQueue.push({deployPlanFile: serviceDeployPlanFile, res: deployResult})
                }
                console.log(`services in ${serviceDefinitionFile} have been started`)
            } catch (e) {
                console.error(`ERROR when deploying services in ${serviceDefinitionFile}:`, e)
            }
        }
        
        // send deploy result
        for (let deployResult of serviceRuntimeQueue) {
            const res = await sendDeployResultToRepository(deployResult.res)
            console.log(`response of updateServiceRuntime for [${deployResult.deployPlanFile}]:`, res)
        }
    }
    
    jobs().then(()=>{}).catch(e=> {
        console.error('Error while deploying services:', e)
    })
}
