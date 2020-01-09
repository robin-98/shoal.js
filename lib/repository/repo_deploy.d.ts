import { RepositoryConnect } from './repo_connect';
import { Sardines } from 'sardines-core';
import { Service } from './repo_data_structure';
export interface ServiceDeploymentTargets {
    application: string;
    services: {
        module: string;
        name: string;
        version: string;
    }[];
    hosts: string[];
    version: string;
    useAllProviders: boolean;
    providers?: any[];
    initParams?: any[];
}
export interface ExtendedServiceIdentity extends Sardines.ServiceIdentity {
    application_id?: string;
    service_id?: string;
}
export interface DeployResultCacheItem {
    entry: {
        type: Sardines.Runtime.ServiceEntryType;
        providerName: string;
        providerInfo: Sardines.ProviderPublicInfo;
    };
    services: {
        identity: ExtendedServiceIdentity;
        settingsForProvider: Sardines.ServiceSettingsForProvider;
        arguments?: Sardines.ServiceArgument[];
    }[];
}
export interface DeployResultCache {
    [appName: string]: {
        [pvdrkey: string]: DeployResultCacheItem;
    };
}
export interface ProviderCache {
    [pvdrkey: string]: Sardines.ProviderDefinition;
}
export declare class RepositoryDeployment extends RepositoryConnect {
    constructor();
    protected validateShoalUser(token: string): Promise<void>;
    updateResourceInfo(resourceInfo: Sardines.Runtime.Resource, token: string): Promise<any>;
    protected createOrUpdateResourceInfo(resourceInfo: Sardines.Runtime.Resource): Promise<any>;
    protected generateDeployPlanFromBunchOfServices(serviceList: Service[]): Promise<{
        deployPlan: Sardines.DeployPlan;
        serviceDescObj: Sardines.ServiceDescriptionFile;
    }[] | null>;
    deployServices(targets: ServiceDeploymentTargets, token: string, bypassToken?: boolean): Promise<{
        hostInfo: any;
        res: any;
    }[] | null>;
    parseDeployResult(runtimeOfApps: Sardines.Runtime.DeployResult): Promise<{
        deployResult: DeployResultCache;
        providers: ProviderCache;
    }>;
    uploadServiceDeployResult(runtimeOfApps: Sardines.Runtime.DeployResult, token: string, bypassToken?: boolean): Promise<Sardines.Runtime.ServiceRuntimeUpdateResult>;
    reloadPendingServices(resourceInDB: any): Promise<void>;
}
//# sourceMappingURL=repo_deploy.d.ts.map