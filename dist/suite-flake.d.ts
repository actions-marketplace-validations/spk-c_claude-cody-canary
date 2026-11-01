import { type SuiteRunResult } from './suite.js';
export interface SuiteFlakeResult {
    schemaVersion: 1;
    suitePath: string;
    createdAt: string;
    runs: number;
    passRate: number;
    classification: 'stable' | 'noisy' | 'flaky';
    scenarioStability: Array<{
        path: string;
        appearances: number;
        passes: number;
        passRate: number;
        fingerprintCounts: Record<string, number>;
    }>;
    results: SuiteRunResult[];
    jsonArtifactPath?: string;
    markdownArtifactPath?: string;
}
export declare function summarizeSuiteFlakiness(suitePath: string, results: SuiteRunResult[]): SuiteFlakeResult;
export declare function formatSuiteFlakeMarkdown(result: SuiteFlakeResult): string;
export declare function analyzeSuiteFlakiness(suitePath: string, options?: {
    cwd?: string;
    runs?: number;
    executableOverride?: string;
    concurrency?: number;
    writeArtifacts?: boolean;
}): Promise<SuiteFlakeResult>;
//# sourceMappingURL=suite-flake.d.ts.map