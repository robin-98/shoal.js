import { StorageSettings, PostgresDatabaseStructure, Storage, PostgresTempleteAccount, Account as TempleteAccount } from 'sardines-built-in-services';
export declare const extraPostgresDBStruct: PostgresDatabaseStructure;
export interface RepositorySettings {
    db: StorageSettings;
    fs?: StorageSettings;
    owner: Account;
    shoalUser?: Account;
}
export interface ServiceArgument {
    type: string;
    name: string;
}
export interface Service {
    id?: string;
    application?: string;
    application_id?: string;
    module: string;
    name: string;
    arguments?: ServiceArgument[];
    return_type?: string;
    is_async?: boolean;
    version?: string;
    source_id?: string;
    is_public?: boolean;
    owner?: string;
    developers?: string[];
    provider_settings?: any[];
    init_params?: any;
    last_access_on?: any;
    file_path?: string;
}
export interface Account extends TempleteAccount {
    can_create_application?: boolean;
    can_create_service?: boolean;
    can_manage_repository?: boolean;
    password?: string;
}
export interface Application {
    id?: string;
    name?: string;
    is_public?: boolean;
    owner_id?: string;
    developers?: string[];
    last_access_on?: any;
}
export declare enum SourceType {
    git = "git"
}
export interface Source {
    id?: string;
    type?: string;
    url?: string;
    root?: string;
    last_access_on?: any;
}
export declare class RepositoryDataStructure extends PostgresTempleteAccount {
    protected fs: Storage | null;
    protected owner: Account | null;
    protected shoalUser: Account | null;
    constructor();
    setup(repoSettings: RepositorySettings): Promise<boolean>;
    createAccount(username: string, password: string, token: string): Promise<string | null>;
    protected checkAppPrivilege(appIdentity: Application, token: string, account: Account): Promise<Application>;
    createOrUpdateApplication(application: Application, token: string): Promise<any>;
    deleteApplication(application: Application, token: string): Promise<any>;
    queryApplication(application: Application | {
        id: string;
    }, token: string): Promise<any>;
    protected checkServicePrivilege(service: Service, token: string, account: Account): Promise<Service | null>;
    createOrUpdateService(serviceArg: Service | Service[], token: string): Promise<any>;
    queryService(service: Service, token: string, bypassToken?: boolean, limit?: number): Promise<Service | Service[] | null>;
    deleteService(service: Service, token: string): Promise<any>;
    checkSourcePrivilege(source: Source, token: string, account: Account): Promise<Source | null>;
    querySource(source: Source, token: string, bypassToken?: boolean): Promise<Source | null>;
    createOrUpdateSource(source: Source, token: string): Promise<any>;
    deleteSource(source: Source, token: string): Promise<any>;
}
//# sourceMappingURL=repo_data_structure.d.ts.map