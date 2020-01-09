import { Sardines } from 'sardines-core';
import { SardinesAgentInit } from './agent_init';
export interface ServiceDeployPlan {
    deployPlan: Sardines.DeployPlan;
    serviceDescObj: Sardines.ServiceDescriptionFile;
}
export declare class SardinesAgentRuntime extends SardinesAgentInit {
    constructor();
    deployService(data: ServiceDeployPlan[]): Promise<any>;
    removeServices(data: {
        applications: string[];
        modules: string[];
        services: string[];
        versions: string[];
    }): Promise<string[]>;
}
//# sourceMappingURL=agent_runtime.d.ts.map