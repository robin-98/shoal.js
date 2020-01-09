import { RepositorySettings } from './repo_data_structure';
export { RepositorySettings } from './repo_data_structure';
import { Account, Service, Application, Source } from './repo_data_structure';
export declare const setup: (settings: RepositorySettings) => Promise<boolean | undefined>;
export declare const signIn: (account: Account, password: string) => Promise<string>;
export declare const signOut: (token: string) => Promise<any>;
export declare const signUp: (username: string, password: string, token: string) => Promise<string>;
export declare const createOrUpdateApplication: (application: Application, token: string) => Promise<any>;
export declare const queryApplication: (application: Application | {
    id: string;
}, token: string) => Promise<any>;
export declare const deleteApplication: (application: Application, token: string) => Promise<any>;
export declare const queryService: (service: Service, token: string) => Promise<Service | null>;
export declare const createOrUpdateService: (service: Service, token: string) => Promise<Service | null>;
export declare const deleteService: (service: Service, token: string) => Promise<any>;
export declare const querySource: (source: Source, token: string) => Promise<Source | null>;
export declare const createOrUpdateSource: (source: Source, token: string) => Promise<Source | null>;
export declare const deleteSource: (source: Source, token: string) => Promise<any>;
export declare const fetchServiceRuntime: (serviceIdentity: any, token: string) => Promise<any>;
export declare const resourceHeartbeat: (data: any, token: string) => Promise<any>;
export declare const updateResourceInfo: (data: any, token: string) => Promise<any>;
export declare const deployServices: (data: any, token: string) => Promise<any>;
export declare const uploadServiceDeployResult: (data: any, token: string) => Promise<any>;
export declare const removeServiceRuntime: (data: any, token: string) => Promise<any>;
//# sourceMappingURL=index.sardine.d.ts.map