#!/usr/bin/env python3
import json
import sys

if len(sys.argv) < 2:
  print('repository interface file is required')
  sys.exit(1)

repo_interface_file = sys.argv[1]

if len(sys.argv) < 3:
  print('target path is required')
  sys.exit(1)

target_path = sys.argv[2]

try:
  with open(repo_interface_file) as f:
    repo = json.loads(f.read())
    if repo is not None and repo["services"] is not None:
      for service in repo["services"]:
        if service["filepath"] is not None:
          del service["filepath"]
        if service["isAsync"] is not None:
          del service["isAsync"]
    with open(target_path, 'w') as o:
      o.write('export const Repository = ')
      o.write(json.dumps(repo, indent=2))
      o.close()
    f.close()
except Exception as e:
  print('Error when publishing repository interface file:', e)

