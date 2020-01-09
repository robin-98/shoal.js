import { Sardines } from 'sardines-core';
import { SystemLoad } from '../interfaces/system_load';
export declare const maxNameLength = 30;
export declare const maxDeviceSummaryLength = 300;
export declare const getCurrentLoad: (hostname: string, account: string, type?: Sardines.Runtime.ResourceType) => Promise<SystemLoad | null>;
//# sourceMappingURL=host_perf.d.ts.map