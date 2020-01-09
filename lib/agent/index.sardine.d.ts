import { Resource } from './agent_init';
import { ServiceDeployPlan } from './agent_runtime';
export declare const agentState: import("../interfaces").AgentState;
export declare const deployService: (data: ServiceDeployPlan[]) => Promise<any>;
export declare const startHost: (hostInfo: Resource, heartbeatInterval?: number) => Promise<void>;
export declare const removeServices: (data: any) => Promise<string[]>;
//# sourceMappingURL=index.sardine.d.ts.map