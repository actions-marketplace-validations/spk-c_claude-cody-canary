import type { Scenario } from './config.js';
import type { RunResult } from './types.js';
export interface BisectResult {
    firstBadIndex: number;
    firstBadCommand: string;
    runs: Map<number, RunResult>;
}
export interface ReleaseBisectResult {
    firstBadIndex: number;
    firstBadVersion: string;
    versions: string[];
    runs: Map<number, RunResult>;
}
export interface ReleaseBisectOptions {
    cwd?: string;
    platform?: string;
    onStatus?: (message: string) => void;
}
export declare function findFirstBadIndex(itemCount: number, runPassed: (index: number) => Promise<boolean>, describe?: (index: number) => string): Promise<number>;
export declare function bisectCommands(scenario: Scenario, commands: string[], cwd?: string): Promise<BisectResult>;
export declare function bisectReleases(scenario: Scenario, versions: string[], options?: ReleaseBisectOptions): Promise<ReleaseBisectResult>;
//# sourceMappingURL=bisect.d.ts.map