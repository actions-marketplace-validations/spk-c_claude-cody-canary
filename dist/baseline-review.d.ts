import { type BaselineSnapshot } from './baseline.js';
export interface BaselineProposal {
    schemaVersion: 1;
    scenario: string;
    targetPath: string;
    proposalPath: string;
    previous?: BaselineSnapshot;
    proposed: BaselineSnapshot;
    markdown: string;
}
export declare function proposeBaselineUpdate(scenarioPath: string, options?: {
    cwd?: string;
    executableOverride?: string;
    target?: string;
}): Promise<BaselineProposal>;
export declare function applyBaselineProposal(proposalPath: string, targetPath: string): Promise<BaselineSnapshot>;
//# sourceMappingURL=baseline-review.d.ts.map