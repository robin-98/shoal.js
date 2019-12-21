# Sardines Shoal Operation Manual

## Functions

### Start Repository
```
npm run startRepo
```

### Register system user
```
manage-sardines-repo --create-account=sardines_shoal_admin:password_for_shao_admin
```

### Deploy host
```
./bin/deploy_host.py --host-name nw-dev01 
                     --os-user rin
                     --repo-deploy-file deploy-repository-dev.json
```

### Deploy Service
```
./bin/deploy_service.py --application dietitian 
                        --providers ./test/providers-dietitian.json 
                        --init-parameters ./test/init-params-dietitian.json
                        --repo-deploy-plan deploy-repository-dev.json
```

## Scenarios

### When host public IP address changed
Affections:
1. all associated service runtimes with the public IP in its provider info

Solution:
1. Remove the affected service runtimes
```
manage-sardines-repo --remove-service-runtime-on-hosts=rin@mba-robin deploy-repository-dev.json
```

2. Re-deploy those services if needed
