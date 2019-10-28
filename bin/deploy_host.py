#!/usr/bin/env python3
import sys
import os
import argparse
import json
import getpass
import socket
from lib.read_deploy_plan import readDeployPlan

cwd = os.getcwd()
argParser = argparse.ArgumentParser(description='Deploy the sardines shoal agent on a remote host via ssh')
argParser.add_argument('--repo-deploy-file', type=str, required=True, help='The sardines repository used to manage the resource')
argParser.add_argument('--host-name', type=str, required=False, help='Remote host name')
argParser.add_argument('--use-repo-providers', type=bool, required=False, default=False, help='used when deploying repository services on local machine, to use providers in repo deploy plan')
argParser.add_argument('--os-user', type=str, required=False, help='OS user on the remote host')
argParser.add_argument('--ipv4', type=str, required=False, help='IPv4 address of the remote host')
argParser.add_argument('--ssh-port', type=int, required=False, help='SSH port of the remote host')
argParser.add_argument('--ipv6', type=str, required=False, help='IPv6 address of the remote host')
argParser.add_argument('--node-bin', type=str, required=False, default='./bin/node-v12.8.0-linux-x64.tar.xz', help='Node binary package to be copied to remote host')
argParser.add_argument('--shoal-pkg', type=str, required=False, default=cwd, help='Sardines shoal source package location')
argParser.add_argument('--providers', type=str, required=False, default='sardines-service-provider-http', help='Providers for the host to launch services, seperated by ","')
argParser.add_argument('--provider-settings', type=str, required=False, default='null', help='Provider settings for the providers, in JSON format, must be an array')
argParser.add_argument('--only-gen-agent-deploy-plan', type=bool, required=False, default=False, help='Only generate deploy plan of agent on target host')
argParser.add_argument('--agent-deploy-plan-file', type=str, required=False, default='./tmp-deploy-agent.json', help='Agent deploy plan file path')
argParser.add_argument('--agent-heartbeat-interval-sec', type=int, required=False, default=58, help='Heartbeat interval in seconds')
args = argParser.parse_args()

(host, entries, drivers, repoProviders) = readDeployPlan(args.repo_deploy_file)

target_addr = args.host_name
if not target_addr:
  target_addr = args.ipv4
if not target_addr:
  target_addr = args.ipv6
if not target_addr:
  args.use_repo_providers = True
  if host is not None and 'name' in host:
    target_addr = host['name']
if not target_addr:
  target_addr = socket.gethostname()

ipaddr = None
if args.ipv4:
  ipaddr = args.ipv4
# the following can work but is not stable
# if not ipaddr and target_addr:
#   ipaddr = socket.gethostbyname(target_addr)
#   if ipaddr in ['127.0.0.1']:
#     ipaddr = None

if not args.only_gen_agent_deploy_plan:
  if not target_addr or target_addr in ['localhost', '127.0.0.1', 'local']: 
    print('invalid target host', target_addr)
    sys.exit(1)
elif not target_addr or target_addr == 'local':
  target_addr = 'localhost'

# prepare repository entries and drivers for init service '/agent/setupRepositoryEntries'
# Prepare providers info for agent deploy plan
try:
  providers = args.providers.split(',')
  providerSettings = json.loads(args.provider_settings)
  if args.providers != 'sardines-service-provider-http' and (providerSettings is None or len(providers) != len(providerSettings)):
    raise Exception('Providers and drivers and settings for the providers must be provided and paired')
  elif args.providers == 'sardines-service-provider-http' and providerSettings is None:
    providerSettings = [{
      "host": "0.0.0.0",
      "port": 8080,
      "protocol": "http",
      "root": "/",
      "bodyParser": {
          "formLimit": "10m",
          "jsonLimit": "10m",
          "textLimit": "10m"
      },
      "safeGuard": True,
      "cors": {
          "credentials": True
      },
      "syslog": True,
      "public": {
          "protocol": "http",
          "host": target_addr,
          "root": "/",
          "port": 8080,
          "driver": "sardines-service-driver-http"
      }
    }]
except Exception as e:
  print('Error while parsing providers and drivers and their settings')
  print(e)
  sys.exit(1)

# prepare sardines.shoal.agent deploy plan
agent_deploy_plan = {
  "providers": [],
  "applications": [{
    "name": "sardines",
    "code": {
      "locationType": "file",
      "location": "./lib"
    },
    "version": "*",
    "init": [{
      "service": "/agent/startHost",
      "arguments": []
    }]
  }]
}

# prepare agent provider settings
if not args.use_repo_providers:
  for i in range(0, len(providers)):
    provider = providers[i]
    settings = providerSettings[i]
    agent_deploy_plan["providers"].append({
      "name": provider,
      "code": {
          "locationType": "npm"
      }, 
      "providerSettings": settings
    })
else:
  agent_deploy_plan["providers"] = repoProviders

# Prepare host info
if args.os_user is not None:
  os_user = args.os_user
else:
  os_user = getpass.getuser()
if not os_user:
  os_user = 'sardines'

host_info = {
  "name": target_addr,
  "account": os_user,
  "address": {},
  "providers": agent_deploy_plan["providers"]
}
if ipaddr is not None:
  host_info["address"]["ipv4"] = ipaddr

if args.ipv6 is not None:
  host_info["address"]["ipv6"] = args.ipv6

if args.ssh_port is not None:
  host_info["address"]["ssh_port"] = args.ssh_port

# set host info as parameter for init service '/agent/startHost'
agent_deploy_plan['applications'][0]['init'][0]['arguments'].append(host_info)
agent_deploy_plan['applications'][0]['init'][0]['arguments'].append(args.agent_heartbeat_interval_sec*1000)

# generate deploy plan file for agent services
try:
  agentDeployPlanFile = args.agent_deploy_plan_file
  with open(agentDeployPlanFile,'w') as f:
    json.dump(agent_deploy_plan, f, indent = 4)
    f.close()
  print('Agent deploy plan has been generated at ' + agentDeployPlanFile)
except Exception as e:
  print('Error while generating deploy plan for the agent services')
  print(e)
  sys.exit(1)

if args.only_gen_agent_deploy_plan:
  sys.exit(0)

# copy sardines.shoal to target host
# Prepare host ssh access info
node_bin = args.node_bin

def ssh_exec(cmd, work_dir = '~', env = None, bypassError = False):
  ssh_cmd = 'ssh'
  if args.ssh_port:
    ssh_cmd += ' -p ' + args.ssh_port
  remote_cmd = ''
  if work_dir != '~':
    remote_cmd = 'cd ' + work_dir + '; '
  remote_path = '/usr/local/bin:/usr/bin:/bin:$HOME/bin'
  if env == 'node':
    remote_cmd += 'export PATH='+ remote_path +':~/node/bin:./node_modules/.bin; '
  remote_cmd += cmd
  
  ssh_cmd += ' ' + os_user + '@' + target_addr + ' "' + remote_cmd + '"'
  print(ssh_cmd)
  cmd_exit_code = os.system(ssh_cmd)
  if cmd_exit_code != 0 and not bypassError:
    print('error when executing ssh command, error code:' + str(cmd_exit_code))
    sys.exit(cmd_exit_code)

def scp(filepath, remote_file_path):
  cmd = 'scp -r'
  if args.ssh_port:
    cmd += ' -P ' + args.ssh_port
  cmd += ' ' + filepath + ' ' + os_user + '@' + target_addr + ':~/' + remote_file_path
  print(cmd)
  cmd_exit_code = os.system(cmd)
  if cmd_exit_code != 0:
    print('error when copying file to remote host, error code:' + str(cmd_exit_code))
    sys.exit(cmd_exit_code)

# setup remote workspace
remote_work_dir = 'sardines.shoal'
ssh_exec('rm -rf ' + remote_work_dir)
ssh_exec('mkdir -p ' + remote_work_dir)

# stop previous watchdog
cronCmd = 'crontab -l|grep -v '+remote_work_dir+'|awk \\"{if(NF>0)print}\\" > ./tmp_cron.txt '
cronCmd += '&& if [ -s ./tmp_cron.txt ];then crontab ./tmp_cron.txt; '
cronCmd += 'else crontab -r; fi'
cronCmd += '&& rm -f ./tmp_cron.txt'
ssh_exec(cronCmd, bypassError=True)

# Copy node binary to the remote host (Linux)
# ssh_exec("ps -ef|grep node|grep -v grep|awk '{print $2}'|xargs kill -9")
ssh_exec('rm -rf node*')
scp(node_bin, 'node.tar.xz')
ssh_exec('tar -xf node.tar.xz && rm -f node.tar.xz && if [ ! -d node ];then mv node* node; fi')

# Copy this sardines.shoal to the remote host
for f in ['src', 'package.json', 'conf', 'sardines-config.json']:
  scp(args.shoal_pkg + '/' + f, remote_work_dir + '/' + f)

# Stop agent and services if exist
ssh_exec('npm run stop', work_dir=remote_work_dir, env='node')

# Build sardines.shoal on remote host
ssh_exec('npm i && npm run build', work_dir=remote_work_dir, env='node')

# copy agent deploy plna
scp(agentDeployPlanFile, remote_work_dir + '/deploy-agent.json')
os.system('rm -f ' + agentDeployPlanFile)

# Start sardines.shoal.agent service
# ssh_exec('sardines-init', work_dir=remote_work_dir, env='node')
# ssh_exec('npm run build', work_dir=remote_work_dir, env='node')
ssh_exec('nohup npm run startAgent >> agent.log 2>&1 &', work_dir=remote_work_dir, env='node')

# Setup watchdog
scp(args.shoal_pkg + '/watchdog.sh', remote_work_dir + '/watchdog.sh')
cmd = 'echo \"WORKSPACE='+ remote_work_dir +'\" > tmp.txt'
cmd += ' && sed "1d" watchdog.sh >> tmp.txt'
cmd += ' && mv tmp.txt watchdog.sh'
ssh_exec(cmd, work_dir=remote_work_dir)

ssh_exec('rm -f ./tmp_cron.txt && crontab -l > ./tmp_cron.txt', bypassError=True)

cmd = '* * * * * sh \$HOME/'+remote_work_dir+'/watchdog.sh > \$HOME/'+remote_work_dir+'/watchdog.log 2>&1'
cronCmd = 'echo \\"'+cmd+'\\" >> ./tmp_cron.txt'
cronCmd += ' && crontab ./tmp_cron.txt && rm -f ./tmp_cron.txt'
ssh_exec(cronCmd)

# END
