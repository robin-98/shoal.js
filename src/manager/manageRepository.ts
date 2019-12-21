import { RepositoryClient, utils} from 'sardines-core'
import { parseDeployPlanFile } from '../deployer/deployer_utils'

import * as fs from 'fs'
import * as proc from 'process'
if (fs.existsSync('../sardines')) {
  console.error('can not find local sardines directory, please run "sardines-init" first')
  proc.exit(1)
}

import * as sardines from '../sardines'
console.log('sardines is imported', sardines)

let { params, files } = utils.parseArgs()
if (params.help) {
  console.log(`
  manage-sardines-repo  [--<arg>=<value>]  <repository deploy plan file>
    --create-account=<account name>:<password>    create an account
    --user=<user name>                : the user to operate the management
    --password=<password>             : password for that user if needed
    --remove-service-runtime-on-hosts : remove service runtimes on hosts: <user1@hostname1>,<user2@hostname2>,...
    --applications                    : application name list to be removed: <appname1>,<appname2>,...
    --help : this menu
  `)
}

const manager = async() => {
  try {
    setupRepoClient()

    // Create an account
    if(params['create-account']) {
      if (params['create-account'].split(':').length !== 2) {
        throw 'invalid new account and password'
      }
      let newUsername = params['create-account'].split(':')[0]
      let newPassword = params['create-account'].split(':')[1]
      return await RepositoryClient.createUser(newUsername, newPassword)
    }

    // Remove service runtime on host
    if (params['remove-service-runtime-on-hosts']) {
      const hostlist = params['remove-service-runtime-on-hosts'].split(',')
      if (!hostlist || !hostlist.length) {
        throw 'unsupported parameter for service runtime removing on hosts'
      }
      return await RepositoryClient.exec('removeServiceRuntime', {hostlist})
    }


  } catch (e) {
    if (e.routine && e.routine === '_bt_check_unique') {
      console.error(`ERROR: Duplicated host`)
    } else {
      console.error(`ERROR when managing repository`)
    }
    throw e
  }

}

const setupRepoClient = () => {
  if (!files || files.length === 0) {
      throw 'Please provide the deploy plan of the repository'
    }
    const repoDeployPlanFile = files[0]
    const repoDeployPlan = parseDeployPlanFile(repoDeployPlanFile)
    let user = params.user, password = params.password
    if (!user || !password) {
      for (let app of repoDeployPlan.applications) {
        if (app.name === 'sardines') {
          for (let serv of app.init) {
            if (serv.service 
              && serv.service.module === '/repository'
              && serv.service.name === 'setup'
              ) {
              user = serv.arguments[0].owner.name
              password = serv.arguments[0].owner.password
              break
            }
          }
        }
      }
    }
    if (!user || !password) {
      throw 'Please provide the user name and its password to manage the repository'
    }

    const entries: any[] = []
    for (let pvdr of repoDeployPlan.providers) {
      entries.push({
        providerInfo: pvdr.providerSettings.public,
        user,
        password
      })
    }
    RepositoryClient.setupRepositoryEntries(entries)
}

manager().then((res) => {
  console.log('Job done, response:', res)
}).catch((e) => {
  console.error(`Repository Manager exit with errors:`, e)
})
