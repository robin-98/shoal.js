import { Sardines } from 'sardines-core';
export declare const rmdir: (dir: string) => void;
export declare const parseDeployPlanFile: (filepath: string, verbose?: boolean) => Sardines.DeployPlan;
export declare const getServiceDefinitionsMap: (applications: any[]) => Map<string, Map<string, Sardines.Service>> | null;
export declare const getRepositoryEntiryAddressesFromDeployPlan: (deployPlan: Sardines.DeployPlan) => Sardines.ProviderPublicInfo[];
//# sourceMappingURL=deployer_utils.d.ts.map