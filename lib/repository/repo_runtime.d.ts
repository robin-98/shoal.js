import { RepositoryDeployment } from './repo_deploy';
import { Sardines } from 'sardines-core';
import { Service } from './repo_data_structure';
export interface RuntimeQueryObject {
    name?: string;
    type?: Sardines.Runtime.ResourceType;
    account?: string;
    service_id?: string;
    status?: Sardines.Runtime.RuntimeStatus;
    workload_percentage?: string;
}
export declare class RepositoryRuntime extends RepositoryDeployment {
    constructor();
    protected defaultLoadBalancingStrategy: Sardines.Runtime.LoadBalancingStrategy;
    protected workloadThreshold: number;
    protected findAvailableRuntime(type: Sardines.Runtime.RuntimeTargetType, target: Service | Sardines.Runtime.Resource, strategy?: Sardines.Runtime.LoadBalancingStrategy): Promise<any>;
    protected getRuntimeQueryObj(type: Sardines.Runtime.RuntimeTargetType, target: Service | Sardines.Runtime.Resource): {
        runtimeObj: RuntimeQueryObject;
        table: string;
    };
    fetchServiceRuntime(serviceIdentity: Sardines.ServiceIdentity | Sardines.ServiceIdentity[], token: string, bypassToken?: boolean): Promise<Sardines.Runtime.Service | Sardines.Runtime.Service[] | null>;
    removeServiceRuntime(data: {
        hosts?: string[];
        applications?: string[];
        modules?: string[];
        services?: string[];
        versions?: string[];
    }): Promise<boolean>;
}
//# sourceMappingURL=repo_runtime.d.ts.map