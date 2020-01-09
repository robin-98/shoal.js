import { Sardines } from 'sardines-core';
import { AgentState } from '../interfaces';
export declare const sendDeployResultToRepository: (deployResult: Sardines.Runtime.DeployResult | null | undefined, agent: AgentState) => Promise<Sardines.Runtime.ServiceRuntimeUpdateResult>;
export interface ServiceDeployment {
    deployResult: any;
    repositoryResponse: any;
}
export declare const deployServices: (targetServices: any, deployPlan: any, agent?: any, send?: boolean) => Promise<ServiceDeployment>;
//# sourceMappingURL=index.d.ts.map