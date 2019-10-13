#!/usr/bin/env python3
import sys
import argparse
import json
from lib.read_entries_from_repository_deploy_plan import readEntriesAndDriversFromRepoDeployPlan

argParser = argparse.ArgumentParser(description = 'Generate sardines config file from repository deployment file')
argParser.add_argument('--repo-deploy-file', type=str, required=True, help='The sardines repository used to manage the resource')
argParser.add_argument('--config-file', type=str, required=True, help='The sardines config file to be generated')
argParser.add_argument('--application', type=str, required=True, help='Application name')
argParser.add_argument('--platform', type=str, required=True, help='Platform, in "nodejs, reactNative, browser"')
argParser.add_argument('--source-root-dir', type=str, required=False, default='./src', help='Source root dir, default is ./src')
argParser.add_argument('--sardines-dir', type=str, required=False, default='sardines', help='Dir for remote sardines services')

cmdlineArgs = argParser.parse_args()

def genConfigFromRepoDeployPlan(args):
  # parse repo deploy plan
  (repoEntries, drivers) = readEntriesAndDriversFromRepoDeployPlan(args.repo_deploy_file)

  config = {
    "application": args.application,
    "platform": args.platform,
    "srcRootDir": args.source_root_dir,
    "sardinesDir": args.sardines_dir,
    "repositoryEntries": repoEntries,
    "drivers": drivers
  }

  try:
    with open(args.config_file, 'w') as f:
      json.dump(config, f, indent=4)
      f.close()
      print('Sardines config file has been generated at [' + args.config_file + ']')
  except Exception as e:
    print('Error while writing sardines config file at [' + args.config_file + ']', e)
    sys.exit(1)

genConfigFromRepoDeployPlan(cmdlineArgs)