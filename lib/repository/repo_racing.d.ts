import { RepositoryHealthy } from './repo_healthy';
import { Sardines } from 'sardines-core';
import { Service } from './repo_data_structure';
export declare const retryLimit = 3;
export declare const jobTimeoutLimitInSeconds = 300;
export declare class RepositoryRacing extends RepositoryHealthy {
    constructor();
    protected genJobTicket(length?: number): string;
    protected racingForJob(type: Sardines.Runtime.RuntimeTargetType, target: Service | Sardines.Runtime.Resource, retry?: number): Promise<{
        permission: boolean;
        runtime: any;
    } | null>;
    deployResource(resourceData: any, token: string): Promise<any>;
    protected deployAgentOnResource(resourceInst: any): Promise<void>;
    deployService(service: any, token: string): Promise<any>;
}
//# sourceMappingURL=repo_racing.d.ts.map