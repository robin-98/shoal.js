import { RepositoryHeart } from './repo_heart';
export declare class RepositoryConnect extends RepositoryHeart {
    constructor();
    protected invokeHostAgent(target: {
        name?: string;
        account?: string;
        id?: string;
    }, service: string, data: any): Promise<{
        res?: any;
        error?: any;
    }>;
}
//# sourceMappingURL=repo_connect.d.ts.map