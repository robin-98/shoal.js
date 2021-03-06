#!/usr/bin/env python3
# Created on Oct 10, 2019, by Robin@naturewake.com
import sys
import os
import argparse
import json
from lib.read_deploy_plan import readDeployPlan

argParser = argparse.ArgumentParser(description = 'command-line-tool to deploy sardines service on any remote host')
argParser.add_argument('--application', type=str, required=True, help='Application name')
argParser.add_argument('--services', nargs="+", type=str, required=False, help='Services to be deployed. For each service, use ":" to specify its module:name:version, or in module:name format; For entire module, can use module:* or module:*:<version number>. Version number is omittable')
argParser.add_argument('--version', type=str, required=False, default='*', help='Target version')
argParser.add_argument('--tags', nargs="+", type=str, required=False, help='Custom tags for the services, seperated by ","')
argParser.add_argument(
  '--hosts',
  nargs="+",
  type=str,
  required=False, 
  help='Target host name or list of hosts, seperated by space, format as "<user name>@<host name>". If omitted then automatically select one'
)
argParser.add_argument('--repo-deploy-plan', type=str, required=True, help='Deploy plan file path for repository')
argParser.add_argument('--use-all-providers', type=bool, required=False, default=True, help='if use all the available providers on target hosts')
argParser.add_argument('--providers', type=str, required=False, help='Provider settings file path or Provider settings json object for the providers, in JSON format, must be an array, but can NOT be used for multiple hosts, this argument is only allowed for one host')
argParser.add_argument('--init-parameters', type=str, required=False, help='Init parameters file path or Init parameters json array for services which need to be init, in JSON format, must be an array, and the sequence is guaranteed while deploying, also for one host usage')
args = argParser.parse_args()

application = args.application
services = args.services
version = args.version
hosts = args.hosts
tags = args.tags

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
  tmpServiceList = []
  for serviceStr in services:
    tmpServiceList.append(Service(serviceStr, version).JSON())
  services = tmpServiceList

# prepare hosts
if hosts is None:
  hosts = []

# Invoke repository service to deploy services
# need to invoke sardines-core from command line to invoke some services
(host, entries, drivers, repoProviders) = readDeployPlan(args.repo_deploy_plan)

cmd = 'sardines-repository-client --cmd="deployServices"'
cmd += " --drivers='" + json.dumps(drivers) + "'"
cmd += " --entries='" + json.dumps(entries) + "'"

data = {
  "application": application,
  "services": services,
  "hosts": hosts,
  "version": version,
  "useAllProviders": args.use_all_providers
}

if tags is not None:
  data["tags"] = tags

if args.providers is not None and not os.path.isfile(args.providers):
  print('loading providers JSON string:', args.providers)
  try:
    data["providers"] = json.loads(args.providers)
  except Exception as e:
    print('ERROR:', e)
    print('--providers error when trying to load json string', args.providers)
    sys.exit(1)
    
if args.init_parameters is not None and not os.path.isfile(args.init_parameters):
  print('loading init parameter JSON string:', args.init_parameters)
  try:
    data["initParams"] = json.loads(args.init_parameters)
  except Exception as e:
    print('ERROR:', e)
    print('--init-parameters error when trying to load json string', args.init_parameters)
    sys.exit(1)

cmd += " --data='" + json.dumps(data) + "'"

if args.providers is not None and os.path.isfile(args.providers):
  cmd += " --provider-settings-file=" + args.providers
    
if args.init_parameters is not None and os.path.isfile(args.init_parameters):
  cmd += " --init-parameters-file=" + args.init_parameters

print(cmd)
exitCode = os.system(cmd)
if exitCode != 0:
  print('Error when invoking repository client')
  sys.exit(1)
