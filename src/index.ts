/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:55
 * @modify date 2019-06-13 15:42:55
 * @desc [description]
 */

import * as serviceDeployer from './deployer/service_deployer'
import { utils } from 'sardines-core'

import * as path from 'path'
import * as proc from 'process'
import * as fs from 'fs'

const serviceDefinitionFile = proc.argv[proc.argv.length - 2]
const serviceDeployPlanFile = proc.argv[proc.argv.length - 1]

import { RepositoryClient } from 'sardines-core'
const sardinesConfigFilepath = path.resolve(proc.cwd(), './sardines-config.json')
if (fs.existsSync(sardinesConfigFilepath)) {
    console.log('loading sardines config:', sardinesConfigFilepath)
    const sardinesConfig = require(sardinesConfigFilepath)
    RepositoryClient.setupRepositoryEntriesBySardinesConfig(sardinesConfig, true)
}

export const startTargetServices = async (targetServices: any) => {
    if (!targetServices) {
        throw utils.unifyErrMesg('services are not correctly compiled', 'shoal', 'start')
    }
    const res = await serviceDeployer.deploy(path.resolve(proc.cwd(), serviceDeployPlanFile), [targetServices], true)
    return res
}

const serviceFilePath = path.resolve(proc.cwd(), serviceDefinitionFile)
if (fs.existsSync(serviceFilePath)) {
    const targetServices = JSON.parse(fs.readFileSync(serviceFilePath).toString())
    startTargetServices(targetServices).then(res => {
        if (res) console.log(`services in ${serviceDefinitionFile} have been started`)
        else throw 'deploy failed'
    })
    .catch(e => {
        console.log(`ERROR when deploying services in ${serviceDefinitionFile}:`, e)
    })
}
