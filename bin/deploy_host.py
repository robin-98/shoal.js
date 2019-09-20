#!/usr/bin/env python3
import sys
import os
import argparse
import json

cwd = os.getcwd()
argParser = argparse.ArgumentParser(description='Deploy the sardines shoal agent on a remote host via ssh')
argParser.add_argument('--host-name', type=str, required=True, help='Remote host name')
argParser.add_argument('--os-user', type=str, default='sardines', help='OS user on the remote host')
argParser.add_argument('--ipv4', type=str, required=False, help='IPv4 address of the remote host')
argParser.add_argument('--ssh-port', type=int, required=False, help='SSH port of the remote host')
argParser.add_argument('--ipv6', type=str, required=False, help='IPv6 address of the remote host')
argParser.add_argument('--node-bin', type=str, required=False, default='./bin/node-v12.8.0-linux-x64.tar.xz', help='Node binary package to be copied to remote host')
argParser.add_argument('--shoal-pkg', type=str, required=False, default=cwd, help='Sardines shoal source package location')
argParser.add_argument('--repo-deploy-file', type=str, required=True, help='The sardines repository used to manage the resource')
argParser.add_argument('--providers', type=str, required=False, default='sardines-service-provider-http', help='Providers for the host to launch services, seperated by ","')
argParser.add_argument('--provider-settings', type=str, required=False, default='null', help='Provider settings for the providers, in JSON format, must be an array')


args = argParser.parse_args()
target_addr = args.host_name
if not target_addr:
  target_addr = args.ipv4
if not target_addr:
  target_addr = args.ipv6

if not target_addr: 
  print('invalid target host')
  sys.exit(1)

# Prepare providers info
try:
  providers = args.providers.split(',')
  providerSettings = json.loads(args.provider_settings)
  if args.providers != 'sardines-service-provider-http' and (providerSettings is None or len(providers) != len(providerSettings)):
    raise Exception('Providers and drivers and settings for the providers must be provided and paired')
  elif args.providers == 'sardines-service-provider-http' and providerSettings is None:
    providerSettings = [{
      "host": "0.0.0.0",
      "port": 8081,
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
          "port": 8081,
          "driver": "sardines-service-driver-http"
      }
    }]
except Exception as e:
  print('Error while parsing providers and drivers and their settings')
  print(e)
  sys.exit(1)

# parse repo deploy plan
try:
  with open(args.repo_deploy_file) as f:
    repoDeployPlan = json.load(f)
    f.close()
except Exception as e:
  print('Error while parsing repository deploy plan')
  print(e)
  sys.exit(1)

# Prepare host ssh access info
os_user = args.os_user
node_bin = args.node_bin

def ssh_exec(cmd, work_dir = '~', env = None):
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
  if cmd_exit_code != 0:
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

# Copy node binary to the remote host (Linux)
# ssh_exec("ps -ef|grep node|grep -v grep|awk '{print $2}'|xargs kill -9")
ssh_exec('rm -rf node*')
scp(node_bin, 'node.tar.xz')
ssh_exec('tar -xf node.tar.xz && rm -f node.tar.xz && if [ ! -d node ];then mv node* node; fi')

# Copy this sardines.shoal to the remote host
remote_work_dir = 'sardines.shoal'
ssh_exec('rm -rf ' + remote_work_dir + ' && mkdir -p ' + remote_work_dir)

for f in ['src', 'package.json', 'conf']:
  scp(args.shoal_pkg + '/' + f, remote_work_dir + '/' + f)

# Stop agent and services if exist
ssh_exec('npm run stop', work_dir=remote_work_dir, env='node')

# Build sardines.shoal on remote host
ssh_exec('npm i && npm run build', work_dir=remote_work_dir, env='node')

# Generate sardines.shoal.agent deploy plan
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
      "service": "/agent/setupRepositoryEntries",
      "arguments": []
    }, {
      "service": "/agent/startHostStat",
      "arguments": [target_addr, 60000]
    }]
  }]
}

try:
  for i in range(0, len(providers)):
    provider = providers[i]
    settings = providerSettings[i]
    agent_deploy_plan["providers"].append({
      "code": {
          "name": provider,
          "locationType": "npm"
      }, 
      "providerSettings": settings
    })

  shoalUser = None
  for app in repoDeployPlan['applications']:
    if 'name' in app and app['name'] == 'sardines' and 'init' in app:
      for item in app['init']:
        if 'service' in item and item['service'] == '/repository/setup':
          shoalUser = item['arguments'][0]['shoalUser']

  repoEntries = []
  for provider in repoDeployPlan['providers']:
    settings = provider['providerSettings']
    publicInfo = settings['public']
    repoEntries.append({
      "providerInfo": publicInfo,
      "user": shoalUser['name'],
      "password": shoalUser['password']
    })

  agent_deploy_plan['applications'][0]['init'][0]['arguments'].append(repoEntries)

  agentDeployPlanFile = args.shoal_pkg + '/' + 'deploy-agent.json'
  with open(agentDeployPlanFile,'w') as f:
    json.dump(agent_deploy_plan, f, indent = 4)
    f.close()
  scp(agentDeployPlanFile, remote_work_dir + '/deploy-agent.json')
except Exception as e:
  print('Error while generating deploy plan for the agent services')
  print(e)
  sys.exit(1)

# Start sardines.shoal.agent service
ssh_exec('nohup npm run startAgent > agent.log 2>1 &', work_dir=remote_work_dir, env='node')
