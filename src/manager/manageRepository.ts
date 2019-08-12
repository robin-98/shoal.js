import { RepositoryClient, utils} from 'sardines-core'
import { parseDeployPlanFile } from '../deployer/deployer_utils'

let { params, files } = utils.parseArgs()
if (params.help) {
  console.log(`
  manage-sardines-repo  [--<arg>=<value>]  <repository deploy plan file>
    --create-account=<account name>:<password>    create an account
    --user=<user name>          : the user to operate the management
    --password=<password>       : password for that user if needed
    --register-host=<hostname>  : register a host named <hostname> for service deployment
    --ipv4=<ipv4 addr>          : ipv4 address for the host which is registered
    --port=<port number>        : ipv4 port number for ssh command on the host which is registered
    --ipv6=<ipv6 addr>          : ipv6 address for the host which is registered
    --host-tags=<tag1,tag2,...> : tags seperated by ',' for the registered host
    --os-user=<os username>     : OS username for the registered host to accept connection of ssh
    --help : this menu
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

    // Create an account
    if(params['create-account']) {
      if (params['create-account'].split(':').length !== 2) {
        throw 'invalid new account and password'
      }
      let newUsername = params['create-account'].split(':')[0]
      let newPassword = params['create-account'].split(':')[1]
      await RepositoryClient.createUser(newUsername, newPassword)
    }

    // Create a resource
    if (params['register-host']) {
      const hostname = params['register-host']
      if (!hostname) {
        throw 'invalid host'
      }
      let addr:any = {}
      for (let key of ['ipv4', 'ipv6', 'port']) {
        if (params[key]) {
          addr[key] = params[key]
        }
      }
      let tags = []
      if (params['host-tags']) {
        tags = params['host-tags'].split(',')
      }
      let account = params['os-user'] || 'sardines'
      return await RepositoryClient.exec('deployHost', { name: hostname, account, address: addr, tags })
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

manager().then((res) => {
  console.log('Job done, response:', res)
}).catch((e) => {
  console.error(`Repository Manager exit with errors:`, e)
})
