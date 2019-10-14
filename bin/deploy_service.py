#!/usr/bin/env python3
# Created on Oct 10, 2019, by Robin@naturewake.com
import sys
import os
import argparse
import json
from lib.read_entries_from_repository_deploy_plan import readEntriesAndDriversFromRepoDeployPlan

argParser = argparse.ArgumentParser(description = 'command-line-tool to deploy sardines service on any remote host')
argParser.add_argument('--application', type=str, required=True, help='Application name')
argParser.add_argument('--services', type=str, required=False, help='Services to be deployed, seperate by ",". For each service, use ":" to specify its module:name:version, or in module:name format; For entire module, can use module:* or module:*:<version number>')
argParser.add_argument('--version', type=str, required=False, default='*', help='Target version')
argParser.add_argument('--hosts', type=str, required=False, help='Target host name or list of hosts, seperated by ",", format as "<user name>@<host name>". If omitted then automatically select one')
argParser.add_argument('--repo-deploy-plan', type=str, required=True, help='Deploy plan file path for repository')

args = argParser.parse_args()

application = args.application
services = args.services
version = args.version
hosts = args.hosts

# prepare services
class Service:
  def __init__(self, serviceStr, version = '*'):
    self.module = None
    self.name = None
    self.version = None
    self.jsonObject = None

    if ':' in serviceStr:
      pair = serviceStr.split(':')
      self.module = pair[0]
      self.name = pair[1]
      if len(pair) > 2:
        self.version = pair[2]
    else:
      # for entire module at highest version
      self.module = 'serviceStr'
      self.name = '*'

    if self.version is None: 
      self.version = version
      
  def JSON(self, application = None):
    if self.jsonObject is None: 
      self.jsonObject = {
        "module": self.module,
        "name": self.name,
        "version": self.version
      }
    if application is not None:
        self.jsonObject["application"] = application
    return self.jsonObject


if services is not None:
  serviceStrings = services.split(',')
  services = []
  for serviceStr in serviceStrings:
    services.append(Service(serviceStr, version).JSON())

# prepare hosts
if hosts is not None:
  if ',' in hosts:
    hosts = hosts.split(',')
  else:
    hosts = [hosts]
else:
  hosts = []

# Invoke repository service to deploy services
# need to invoke sardines-core from command line to invoke some services
(repoEntries, drivers) = readEntriesAndDriversFromRepoDeployPlan(args.repo_deploy_plan)

cmd = 'sardines-repository-client --cmd="deployServices"'
cmd += " --drivers='" + json.dumps(drivers) + "'"
cmd += " --entries='" + json.dumps(repoEntries) + "'"

data = {
  "application": application,
  "services": services,
  "hosts": hosts,
  "version": version
}

cmd += " --data='" + json.dumps(data) + "'"

print(cmd)
exitCode = os.system(cmd)
if exitCode != 0:
  print('Error when invoking repository client')
  sys.exit(1)
