import { RepositoryClient, utils} from 'sardines-core'
import { parseDeployPlanFile } from '../deployer/deployer_utils'

let { params, files } = utils.parseArgs()
if (params.help) {
  console.log(`
  manage-sardines-repo  [--<arg>=<value>]  <repository deploy plan file>
    --create-account=<account name>:<password>    create an account
    --user=<user name>                            provide a user name
    --password=<password>                         password for that user
    --help
  `)
}

const manager = async() => {
  try {
    if (!files || files.length === 0) {
      throw 'Please provide the deploy plan of the repository'
    }
    const repoDeployPlanFile = files[0]
    const repoDeployPlan = await parseDeployPlanFile(repoDeployPlanFile)
    let user = params.user, password = params.password
    if (!user || !password) {
      for (let app of repoDeployPlan.applications) {
        if (app.name === 'sardines') {
          for (let serv of app.init) {
            if (serv.service === '/repository/setup') {
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
        address: {
          type: 'native-http',
          providerInfo: pvdr.providerSettings.public,
        },
        user,
        password
      })
    }
    RepositoryClient.setupRepositoryEntries(entries)

    if(params['create-account']) {
      if (params['create-account'].split(':').length !== 2) {
        throw 'invalid new account and password'
      }
      let newUsername = params['create-account'].split(':')[0]
      let newPassword = params['create-account'].split(':')[1]
      await RepositoryClient.createUser(newUsername, newPassword)
    }

  } catch (e) {
    console.error(`ERROR when managing repository:`, e)
    throw e
  }

}

manager().then(() => {
  console.log('Job done')
}).catch(() => {
  console.error(`Repository Manager exit with errors`)
})
