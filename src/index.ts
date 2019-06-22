/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:55
 * @modify date 2019-06-13 15:42:55
 * @desc [description]
 */

import * as deployer from './deployer'
import * as utils from 'sardines-utils'

import * as path from 'path'
import * as proc from 'process'
import * as fs from 'fs'

export const startRepository = async (repositoryServices: any) => {
    if (!repositoryServices) {
        throw utils.unifyErrMesg('repository services are not correctly compiled', 'shoal', 'repository')
    }
    const res = await deployer.deploy(path.resolve(proc.cwd(), './deploy_plan_repository.json'), repositoryServices, true)
    console.log(res)
}

const repoServiceFile = path.resolve(proc.cwd(), './repository.json')
if (fs.existsSync(repoServiceFile)) {
    const repoServices = JSON.parse(fs.readFileSync(repoServiceFile).toString())
    startRepository(repoServices).then(res => {
        console.log('repository as been started:', res)
    })
    .catch(e => {
        console.log('ERROR when starting repository:', e)
    })
}
