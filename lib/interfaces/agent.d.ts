import { SystemLoad } from './system_load';
import { Sardines } from 'sardines-core';
export interface AgentState {
    hasHostStatStarted: boolean;
    hasHostInfoUpdated: boolean;
    providers: Sardines.Runtime.ProviderCache;
    hostId: string | null;
    perf: SystemLoad | null;
}
//# sourceMappingURL=agent.d.ts.map