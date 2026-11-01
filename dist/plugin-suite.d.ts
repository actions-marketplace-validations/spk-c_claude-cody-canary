import { type Scenario } from './config.js';
import { type PluginDiscovery } from './plugin-init.js';
import { runPluginMatrix, type PluginMatrixEntry, type PluginMatrixResult, type RunPluginMatrixOptions } from './plugin-matrix.js';
export type PluginSuiteScenarioKind = 'load' | 'command' | 'agent' | 'skill' | 'hook' | 'mcp' | 'lsp' | 'custom';
export interface PluginSuiteScenario {
    id: string;
    kind: PluginSuiteScenarioKind;
    component?: string;
    path: string;
    scenario: Scenario;
}
export interface PluginSuiteScenarioResult {
    id: string;
    kind: PluginSuiteScenarioKind;
    component?: string;
    path: string;
    scenario: string;
    entries: PluginMatrixEntry[];
    compatible: number;
    incompatible: number;
    firstIncompatibleVersion?: string;
}
export interface PluginSuiteFailure {
    scenarioId: string;
    scenario: string;
    path: string;
    failures: string[];
}
export interface PluginSuiteVersionResult {
    version: string;
    passed: boolean;
    passedScenarios: number;
    failedScenarios: number;
    durationMs: number;
    toolCalls: number;
    totalTokens: number;
    costUsd?: number;
    failures: PluginSuiteFailure[];
}
export interface PluginSuiteResult {
    schemaVersion: 1;
    kind: 'plugin-compatibility-suite';
    canaryVersion: string;
    pluginName: string;
    suiteDir: string;
    gitCommit: string;
    versions: string[];
    scenarios: PluginSuiteScenarioResult[];
    versionResults: PluginSuiteVersionResult[];
    totalRuns: number;
    compatibleRuns: number;
    incompatibleRuns: number;
    compatibleVersions: number;
    incompatibleVersions: number;
    firstIncompatibleVersion?: string;
    createdAt: string;
    jsonArtifactPath?: string;
    markdownArtifactPath?: string;
}
export interface RunPluginSuiteOptions extends Omit<RunPluginMatrixOptions, 'pluginPath' | 'versions' | 'onStatus' | 'writeArtifacts'> {
    pluginPath: string;
    suiteDir?: string;
    versions?: string[];
    maxRuns?: number;
    writeArtifacts?: boolean;
    onStatus?: (message: string) => void;
    matrixRunner?: typeof runPluginMatrix;
}
export declare function assertGeneratedPluginSuiteFresh(suiteDir: string, discovery: PluginDiscovery): Promise<void>;
export declare function expectedGeneratedPluginSuiteScenarioIds(discovery: PluginDiscovery): string[];
export declare function assertGeneratedPluginSuiteCoverage(scenarios: PluginSuiteScenario[], discovery: PluginDiscovery): void;
export declare function loadGeneratedPluginSuite(suiteDir: string): Promise<PluginSuiteScenario[]>;
export declare function validatePluginSuiteRunBudget(scenarioCount: number, versionCount: number, maxRuns?: number): number;
export declare function aggregatePluginSuiteMatrices(pluginName: string, suiteDir: string, versions: string[], matrices: Array<{
    suiteScenario: PluginSuiteScenario;
    matrix: PluginMatrixResult;
}>): PluginSuiteResult;
export declare function formatPluginSuiteMarkdown(result: PluginSuiteResult): string;
export declare function runPluginSuite(options: RunPluginSuiteOptions): Promise<PluginSuiteResult>;
//# sourceMappingURL=plugin-suite.d.ts.map