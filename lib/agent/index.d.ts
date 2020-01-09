import { ServiceDeployPlan } from './agent_runtime';
import { Resource } from './agent_init';
export { agentState } from './index.sardine';
export declare const deployService: (data: ServiceDeployPlan[]) => Promise<any>;
export declare const startHost: (hostInfo: Resource, heartbeatInterval?: number) => Promise<any>;
export declare const removeServices: (data: any) => Promise<any>;
//# sourceMappingURL=index.d.ts.map