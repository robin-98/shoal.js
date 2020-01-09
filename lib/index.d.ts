import { Sardines } from 'sardines-core';
import * as deployer from './deployer';
export interface DeployJobResult {
    deployPlanFile: string;
    res: Sardines.Runtime.DeployResult;
}
export declare const deployServicesByFiles: (serviceDefinitionFile: string, serviceDeployPlanFile: string, send?: boolean) => Promise<deployer.ServiceDeployment>;
//# sourceMappingURL=index.d.ts.map