import { type ComparisonRegressionResult } from './regressions.js';
import type { RunMetrics, RunResult } from './types.js';
export interface BaselineSnapshot {
    schemaVersion: 1;
    scenarioSchemaVersion: 1;
    scenario: string;
    sourceScenario: string;
    scenarioHash: string;
    createdAt: string;
    gitCommit: string;
    executable: string;
    durationMs: number;
    metrics: RunMetrics;
}
export interface BaselineUpdateOptions {
    cwd?: string;
    output?: string;
    executableOverride?: string;
}
export interface BaselineUpdateResult {
    baselinePath: string;
    snapshot: BaselineSnapshot;
    run: RunResult;
}
export interface BaselineCheckOptions {
    cwd?: string;
    baseline?: string;
    executableOverride?: string;
    gitRefOverride?: string;
}
export interface BaselineCheckResult {
    schemaVersion: 1;
    scenario: string;
    baselinePath: string;
    baseline: BaselineSnapshot;
    candidate: RunResult;
    regressions: ComparisonRegressionResult;
    passed: boolean;
    reportPath: string;
}
export declare function defaultBaselinePath(repoRoot: string, scenarioName: string): string;
export declare function updateBaseline(scenarioPath: string, options?: BaselineUpdateOptions): Promise<BaselineUpdateResult>;
export declare function loadBaseline(file: string): Promise<BaselineSnapshot>;
export declare function checkBaseline(scenarioPath: string, options?: BaselineCheckOptions): Promise<BaselineCheckResult>;
//# sourceMappingURL=baseline.d.ts.map