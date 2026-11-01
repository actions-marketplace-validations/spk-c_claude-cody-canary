import type { Scenario } from './config.js';
import { type PreparedRun } from './runner.js';
import type { RunMetrics, RunResult } from './types.js';
export interface ExperimentAggregate {
    runs: number;
    passed: number;
    failed: number;
    passRate: number;
    avgToolCalls: number;
    avgTotalTokens: number;
    avgDurationMs: number;
    avgCostUsd?: number;
}
export interface ExperimentRunSummary {
    passed: boolean;
    failures: string[];
    durationMs: number;
    metrics: RunMetrics;
}
export interface ExperimentVariantSummary {
    label: 'baseline' | 'candidate';
    configName: string;
    aggregate: ExperimentAggregate;
    runs: ExperimentRunSummary[];
}
export interface ExperimentResult {
    schemaVersion: 1;
    scenario: string;
    gitCommit: string;
    runsPerVariant: number;
    baseline: ExperimentVariantSummary;
    candidate: ExperimentVariantSummary;
    delta: {
        passRatePoints: number;
        avgToolCalls: number;
        avgTotalTokens: number;
        avgDurationMs: number;
        avgCostUsd?: number;
    };
    createdAt: string;
    artifactPath?: string;
}
export interface RunExperimentOptions {
    cwd?: string;
    runs?: number;
    executableOverride?: string;
}
export declare function assertExperimentCompatibleScenario(scenario: Scenario): void;
export declare function validateConfigVariant(variantRoot: string): Promise<void>;
export declare function prepareConfigVariant(worktree: string, variantRoot: string): Promise<PreparedRun>;
export declare function aggregateExperimentRuns(results: RunResult[]): ExperimentAggregate;
export declare function runExperiment(scenario: Scenario, baselineConfig: string, candidateConfig: string, options?: RunExperimentOptions): Promise<ExperimentResult>;
export declare function formatExperiment(result: ExperimentResult): string;
//# sourceMappingURL=experiment.d.ts.map