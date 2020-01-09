import { Sardines } from 'sardines-core';
import { AgentState } from '../interfaces';
export interface Resource extends Sardines.Runtime.Resource {
}
export declare class SardinesAgentInit {
    agentState: AgentState;
    constructor();
    startHost(hostInfo: Resource, heartbeatInterval?: number): Promise<void>;
}
//# sourceMappingURL=agent_init.d.ts.map