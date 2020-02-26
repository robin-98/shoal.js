# Setup Local Test Environment With VMs
### Writen by: Robin *<robin@naturewake.com>*, on *2020-01-14*

For cloud software developing, ***it's not until you fly that you fall***. What **`Sardines`** can guarrantee is that you will get everything ready for the fly on cloud if local VM environment has been prepared.

## Hardware Platform
1. Prepare 4 VMs with *`Ubuntu 18.04 Server`*, 1x `Shoal`, 1x `Database`, 2x `Application`. System requirements:
    1. CPU: 1 core, Memory: 1G
    2. Support *`git`*, *`python3`* and other development kits installed
    3. Mount an extra `Virtual Hard Disk` for the test data on each host
    4. Install `Node.js` on the extra disk
    5. `package-lock` shall be open on all `Application` hosts, if the `Shoal` host is going to be used as an application host, it shall also apply this.
    6. Setup env value `PATH`
    7. *Minmum requirement: sure, one host is OK to setup an all-in-one test environment, but it lacks the mimic of cloud structure* 
2. Setup host names and static IP addresses for these VM hosts, in two seperated and independent network: a `private network` and a `bridged network`. 
    1. Technical References:
        1. [Set a Static IP Address in VMware Fusion](https://willwarren.com/2015/04/02/set-static-ip-address-in-vmware-fusion-7/)
        2. [Configure static IP address on Ubuntu 18.04 ](https://linuxconfig.org/how-to-configure-static-ip-address-on-ubuntu-18-04-bionic-beaver-linux)
    2. **Caution:** the *`DHCP service`* on `CISCO`, `Linksy`s or some other brand routers does **NOT** accept requests from VMs in the bridged network, so please setup `Address Reservation` for these VMs on the router DHCP service
    3. The *Database* host needn't the *bridged network*
    4. *Why a bridged network is necessary: if without the bridged network, applications can only be tested within the same machine of the VMs. Otherwise, with a bridged network, applications can be tested anywhere within the same physical network.*
3. Setup *`single-direct`* SSH trust relationships between the `Shoal` host and `Application` hosts
4. Setup trusted SSH public keys on `github` for the *Shoal* and *Application* hosts
5. Setup *`PostgreSQL Server`* on the database host, [reference](https://tecadmin.net/install-postgresql-server-on-ubuntu/)
    1. change data file directory to the mounted extra virtual hard disk
    2. modify file *`/etc/postgresql/10/main/postgresql.conf`*, append a line: `listen_address = *`
    3. modify file *`/etc/postgresql/10/main/pg_hba.conf`*:
        1. change the string `md5` to `truest` for the lines like `host 127.0.0.1 ...`
        2. append a line: `host all all 0.0.0.0/0 md5`
    4. `sudo systemctl restart postgresql`
6. *Optional: Setup `pgadmin4` on the database host:*
    1. Stop `Nginx`
    2. Install `pgadmin4` and `pgadmin-apache2`: [reference](https://www.howtoforge.com/how-to-install-postgresql-and-pgadmin4-on-ubuntu-1804-lts/)
    3. Enable pgadmin4 with the command: `a2enable pgadmin4`
7. Install & setup *`Redis Server`* on the database host, [refernece](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-18-04)
    1. Modify config file `/etc/redis/redis.conf`:
        1. change `supervised no` to `supervised systemd`
        2. change `bind 127.0.0.1 ::1` to `bind 0.0.0.0 ::1`
        3. change `requirepass ...` to `requirepass Startup@2020`: set the password for redis as `Startup@2020`
    2. Restart Redis service: `sudo systemctl restart redis.service`
    3. Test connection from public ip address using command: `redis-cli -h <public ip address> -p 6379`

## Sardines Platform
1. Prepare the most important file ***`deploy-repository.json`***, which can be derived from the file *`deploy-repository-example.json`* in the source code of `sardines.shoal.js`
2. Setup database on the database host
    1. Copy the script `bin/create_database.py` from the source code of `sardines.shoal.js` to the database host
    2. Copy the `database settings` from file `deploy-repository.json` in `sardines.shoal.js` to a `json` file on the database host
    3. on the database host, run commands to create database instance: 
        1. `sudo -i -u postgres`
        2. `create_database.py ...` (run `create_database.py --help` for help)
3. Setup `Shoal` on the Shoal host:
    1. `git clone` the source code of `sardines.shoal.js`
    2. make sure `node.js` executables are included in `PATH`
    3. Copy file ***`deploy-repository.json`*** to the root directory of `sardines.shoal.js`
    4. under the root directory of `sardines.shoal.js`, run `npm i`
    5. Start system: `nohup npm run startRepo > repository.log 2>&1 &`
4. Setup `Application` hosts:
    1. make sure the *single-direct* SSH trust from the `Shoal` host to the `Applicaton` hosts
    2. on the `Shoal` host, under the root directory of `sardines.shoal.js`, run `bin/deploy_host.py`
    3. **Caution:** in the test envrionment, `IP address` of the `bridged network` shall be ***explicitly*** used in the commond of deployment. This will cause future deployments and invocations of service runtimes to use IP addresses instead of unresolvable host names.

## Deploy Cloud Applications
#### Step 1: Preparation, which could be skipped if has been done before
1. Setup **account for application**: on the **`Shoal` host**, under the root directory of `sardines.shoal.js`, run: `./lib/manager/manageRepository --create-account ...`
2. Setup ***`sardines`*** in the **development environment**
    1. `npm i --save sardines-core`
    2. `npm i -g sardines-compile-time-tools`
    3. setup `sardines-config.json` file under the project root directory
        1. derive from the same file under the root directory of `sardines.shoal.js`
        2. set the application name, account, password etc in that file
    4. under the root directory, run `sardines-init`

#### Step 2: `Publish` the application to test environment
1. Make sure the `repositoryEntries` in the `sardines-config.json` file are pointing to the `Shoal` host in the test environment
2. Just run command `sardines-publish` under the project root directory

#### Setup 3: `Deploy` services to the *Application* hosts
1. On the `Shoal` host, prepare file `init-params.json` and `providers.json` for the application if needed, which could be derived from the examples under the directory `sardines.shoal.js/test`
1. on the `Shoal` host, under the root directory of `sardines.shoal.js`, run the command `bin/deploy_service.py ...`

## Test
1. At anywhere using the cloud application,  in its `sardines-config.json`, point the `repositoryEntries` to the `Shoal` host in the test environment
2. run `sardines-init`
3. **`re-publish`** the `test services` in the test environment or **`re-build`** the `clients` if necessary
4. Logging:
    1. Application logs: on any `Application` hosts, check the log file at `sardines.shoal/agent.log`
    2. Shoal log: on `Shoal` host, check the log file at `sardines.shoal.js/repository.log`

## Done
