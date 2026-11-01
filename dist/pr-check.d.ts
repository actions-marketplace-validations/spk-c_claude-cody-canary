import type { Scenario } from './config.js';
import { type ComparisonRegressionResult } from './regressions.js';
import type { RunResult } from './types.js';
export interface PrCheckOptions {
    cwd?: string;
    baseRef?: string;
    headRef?: string;
    executableOverride?: string;
}
export interface PrCheckResult {
    schemaVersion: 1;
    scenario: string;
    baseRef: string;
    headRef: string;
    baseline: RunResult;
    candidate: RunResult;
    regressions: ComparisonRegressionResult;
    passed: boolean;
    reportPath: string;
}
export declare function runPrCheck(scenario: Scenario, options?: PrCheckOptions): Promise<PrCheckResult>;
//# sourceMappingURL=pr-check.d.ts.map