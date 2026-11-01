import { type Scenario } from './config.js';
import type { RunResult } from './types.js';
export type StabilityClassification = 'stable' | 'noisy' | 'flaky';
type StabilityPolicy = NonNullable<Scenario['stability']>;
export interface FlakeOptions {
    cwd?: string;
    runs?: number;
    executableOverride?: string;
    writeArtifacts?: boolean;
}
export interface FlakeMetricStats {
    min: number;
    max: number;
    mean: number;
    coefficientOfVariation: number;
}
export interface FlakeResult {
    schemaVersion: 1;
    scenario: string;
    createdAt: string;
    runs: number;
    passedRuns: number;
    passRate: number;
    classification: StabilityClassification;
    policyPassed: boolean;
    policyFailures: string[];
    fingerprintCounts: Record<string, number>;
    changedFileVariants: number;
    hookSequenceVariants: number;
    permissionSequenceVariants: number;
    assertionFailureFrequency: Record<string, number>;
    metrics: {
        totalTokens: FlakeMetricStats;
        toolCalls: FlakeMetricStats;
        durationMs: FlakeMetricStats;
    };
    results: RunResult[];
    jsonArtifactPath?: string;
    markdownArtifactPath?: string;
}
export declare function summarizeFlakeRuns(scenario: string, results: RunResult[], policy?: StabilityPolicy): FlakeResult;
export declare function formatFlakeMarkdown(result: FlakeResult): string;
export declare function analyzeFlakiness(scenarioPath: string, options?: FlakeOptions): Promise<FlakeResult>;
export {};
//# sourceMappingURL=flake.d.ts.map