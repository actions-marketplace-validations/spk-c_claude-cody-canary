import type { Scenario } from './config.js';
export interface ReproOptions {
    cwd?: string;
    scenarioPath?: string;
    output?: string;
    force?: boolean;
}
export interface ReproBundleResult {
    outputPath: string;
    scenarioPath: string;
    baseCommit: string;
    exportedFiles: string[];
    skippedFiles: string[];
    redactedFiles: string[];
}
export declare function isDeniedFixturePath(value: string): boolean;
export declare function fixtureRootFromPattern(pattern: string): string | null;
export declare function collectFixtureRoots(scenario: Scenario): string[];
export declare function createReproBundle(resultPath: string, options?: ReproOptions): Promise<ReproBundleResult>;
//# sourceMappingURL=repro-core.d.ts.map