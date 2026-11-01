import { type ScenarioSuite } from './suite.js';
export interface SuiteInitOptions {
    cwd?: string;
    output?: string;
    name?: string;
    include?: string[];
    concurrency?: number;
    maxRuns?: number;
    failFast?: boolean;
    reuseResults?: boolean;
    force?: boolean;
    dryRun?: boolean;
}
export interface SuiteInitResult {
    name: string;
    output: string;
    outputPath: string;
    scenarioCount: number;
    scenarios: string[];
    suite: ScenarioSuite;
    yaml: string;
    written: boolean;
}
export declare function initializeSuite(options?: SuiteInitOptions): Promise<SuiteInitResult>;
export declare function runSuiteInitCli(args: string[]): Promise<void>;
//# sourceMappingURL=suite-init.d.ts.map