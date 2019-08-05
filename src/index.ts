/**
 * @author Robin Sun
 * @email robin@naturewake.com
 * @create date 2019-06-13 15:42:55
 * @modify date 2019-06-13 15:42:55
 * @desc [description]
 */

import * as deployer from './deployer'
import { utils } from 'sardines-core'

import * as path from 'path'
import * as proc from 'process'
import * as fs from 'fs'

export const startRepository = async (repositoryServices: any) => {
    if (!repositoryServices) {
        throw utils.unifyErrMesg('repository services are not correctly compiled', 'shoal', 'repository')
    }
    const res = await deployer.deploy(path.resolve(proc.cwd(), './deploy_repository.json'), [repositoryServices], true)
    console.log('deploy result:', res)
    return res
}

const repoServiceFile = path.resolve(proc.cwd(), './repository.json')
if (fs.existsSync(repoServiceFile)) {
    const repoServices = JSON.parse(fs.readFileSync(repoServiceFile).toString())
    startRepository(repoServices).then(res => {
        if (res) console.log('repository as been started:', res)
        else throw 'deploy failed'
    })
    .catch(e => {
        console.log('ERROR when starting repository:', e)
    })
}
