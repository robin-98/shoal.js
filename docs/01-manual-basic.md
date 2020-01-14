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

Solutions:
1. Re-deploy host and service runtimes
    1. Remove the affected service runtimes
    ```
    ./lib/manager/manageRepository --remove-service-runtime-on-hosts=rin@mba-robin deploy-repository-dev.json
    ```
    2. Re-deploy those services if needed

2. Update host IP address directly, and service runtimes which used the old host IP address would be updated as well
    ```
    ./lib/manager/manageRepository.js --update-resource --host=rin@nw-test03 --ipv4=10.183.197.143 deploy-repository.json
    ```
