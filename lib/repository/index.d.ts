import * as origin from './index.sardine';
import { Account } from './repo_data_structure';
import { Application } from './repo_data_structure';
import { Service } from './repo_data_structure';
import { Source } from './repo_data_structure';
export { RepositorySettings } from './repo_data_structure';
export declare const setup: (settings: origin.RepositorySettings) => Promise<any>;
export declare const signIn: (account: Account, password: string) => Promise<any>;
export declare const signOut: (token: string) => Promise<any>;
export declare const signUp: (username: string, password: string, token: string) => Promise<any>;
export declare const createOrUpdateApplication: (application: Application, token: string) => Promise<any>;
export declare const queryApplication: (application: Application | {
    id: string;
}, token: string) => Promise<any>;
export declare const deleteApplication: (application: Application, token: string) => Promise<any>;
export declare const queryService: (service: Service, token: string) => Promise<any>;
export declare const createOrUpdateService: (service: Service, token: string) => Promise<any>;
export declare const deleteService: (service: Service, token: string) => Promise<any>;
export declare const querySource: (source: Source, token: string) => Promise<any>;
export declare const createOrUpdateSource: (source: Source, token: string) => Promise<any>;
export declare const deleteSource: (source: Source, token: string) => Promise<any>;
export declare const fetchServiceRuntime: (serviceIdentity: any, token: string) => Promise<any>;
export declare const resourceHeartbeat: (data: any, token: string) => Promise<any>;
export declare const updateResourceInfo: (data: any, token: string) => Promise<any>;
export declare const deployServices: (data: any, token: string) => Promise<any>;
export declare const uploadServiceDeployResult: (data: any, token: string) => Promise<any>;
export declare const removeServiceRuntime: (data: any, token: string) => Promise<any>;
//# sourceMappingURL=index.d.ts.map