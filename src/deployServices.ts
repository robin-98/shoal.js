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

export const deployServices = async (serviceDefinitionFile: string, serviceDeployPlanFile: string) => {
    const startTargetServices = async (targetServices: any, serviceDeployPlanFile: string) => {
        if (!targetServices) {
            throw utils.unifyErrMesg('services are not correctly compiled', 'shoal', 'start')
        }
        const res = await serviceDeployer.deploy(path.resolve(proc.cwd(), serviceDeployPlanFile), [targetServices], true)
        return res
    }

    const serviceFilePath = path.resolve(proc.cwd(), serviceDefinitionFile)
    if (fs.existsSync(serviceFilePath)) {
        const targetServices = JSON.parse(fs.readFileSync(serviceFilePath).toString())
        const res = await startTargetServices(targetServices, serviceDeployPlanFile)
        if (res) return res
        else throw 'deploy failed'
    } else {
        throw `can not access service description file [${serviceFilePath}]`
    }
}

const {files} = utils.parseArgs()
if (files && files.length >= 2 && files.length % 2 === 0) {
    const jobs = async() => {
        interface DeployJobResult {
            deployPlanFile: string
            res: Sardines.Runtime.DeployResult
        }
        const serviceRuntimeQueue: DeployJobResult[] = []
        for (let i = 0; i<files.length; i+=2) {
            const serviceDefinitionFile = files[i]
            const serviceDeployPlanFile = files[i+1]
            try {
                const res = await deployServices(serviceDefinitionFile, serviceDeployPlanFile)
                serviceRuntimeQueue.push({deployPlanFile: serviceDeployPlanFile, res})
                console.log(`services in ${serviceDefinitionFile} have been started`)
            } catch (e) {
                console.error(`ERROR when deploying services in ${serviceDefinitionFile}:`, e)
            }
        }

        const sendDeployResultToRepository = async(deployResult: DeployJobResult, hostId: string) => {
            if (!deployResult || !deployResult.res ) return
            // if config file exists it will be used 
            // to setup repo_client module automatically
            // no worry about using repo_client module

            // wrap hostId
            const data :any = {
                resourceId: hostId,
                deployResult: deployResult.res
            }

            // use repo_client to send service runtimes to its self
            let res = await RepositoryClient.exec('updateServiceRuntime', data)
            console.log(`response of updateServiceRuntime for [${deployResult.deployPlanFile}]:`, res)

            // or just invoke repository method from memory
            // it's also OK to use repository instance from inside
            // because at this time, the repository instance has been initialized
            // and database is also ready
            // but firstly, need to login using shoalUser
            // it's duplicated process with repo_client, so don't use inside invocation
        }
        
        // wait for agent to get host id
        while (!agent.hasHostStatStarted || !agent.hostId) {
            await utils.sleep(100)
        }
        // send deploy result
        for (let deployResult of serviceRuntimeQueue) {
            await sendDeployResultToRepository(deployResult, agent.hostId)
        }
    }
    
    jobs().then(()=>{}).catch(e=> {
        console.error('unknow error while deploying services:', e)
    })
}
