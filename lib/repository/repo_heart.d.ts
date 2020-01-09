import { RepositoryDataStructure } from './repo_data_structure';
import { SystemLoad } from '../interfaces/system_load';
export declare class RepositoryHeart extends RepositoryDataStructure {
    [key: string]: any;
    private intervalHeartbeat;
    protected heartbeatTimespan: number;
    protected heartbeatCount: number;
    protected jobsInHeart: {
        [name: string]: {
            name: string;
            intervalCounts: number;
            startRound: number;
        };
    };
    constructor();
    protected appendJobInHeart(jobName: string, startRound?: number, intervalCounts?: number): void;
    stopHeart(): void;
    private startHeart;
    private heart;
    private removeOutDatePerfData;
    resourceHeartbeat(data: {
        load: SystemLoad;
        runtimes: string[];
    }, token: string): Promise<"OK" | null>;
    private checkPendingServices;
}
//# sourceMappingURL=repo_heart.d.ts.map