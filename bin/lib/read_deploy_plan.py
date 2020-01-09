import sys
import json

def readDeployPlan(deployPlanFilepath):
  try:
    with open(deployPlanFilepath) as f:
      deployPlan = json.load(f)
      f.close()
  except Exception as e:
    print('Error while reading repository deploy plan file')
    print(e)
    sys.exit(1)

  # prepare repository entries and drivers for init service '/agent/setupRepositoryEntries'
  shoalUser = None
  for app in deployPlan['applications']:
    if 'name' in app and app['name'] == 'sardines' and 'init' in app:
      for item in app['init']:
        if 'service' in item and item['service'] is not None:
          if 'module' in item['service'] and item['service']['module'] == '/repository':
            if 'name' in item['service'] and item['service']['name'] == 'setup':
              shoalUser = item['arguments'][0]['shoalUser']

  if 'host' in deployPlan:
    host = deployPlan['host']
  entries = []
  drivers = []
  dirverCache = {}
  repoProviders = deployPlan['providers']
  for provider in repoProviders:
    settings = provider['providerSettings']
    publicInfo = settings['public']
    entries.append({
      "providerInfo": publicInfo,
      "user": shoalUser['name'],
      "password": shoalUser['password']
    })
    if "driver" in publicInfo and "protocol" in publicInfo:
      driverName = publicInfo["driver"]
      protocol = publicInfo["protocol"]
      if driverName not in dirverCache:
        drivers.append({
          "name": driverName,
          "locationType": "npm",
          "protocols": [protocol]
        })
      else:
        driverInCache = dirverCache[driverName]
        if protocol not in driverInCache['protocols']:
          driverInCache['protocols'].append(protocol)

  return (host, entries, drivers, repoProviders)