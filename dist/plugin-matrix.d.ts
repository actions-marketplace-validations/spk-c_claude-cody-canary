import type { Scenario } from './config.js';
export interface PluginMatrixEntry {
    version: string;
    passed: boolean;
    failures: string[];
    durationMs: number;
    toolCalls: number;
    totalTokens: number;
    costUsd?: number;
}
export interface PluginMatrixResult {
    schemaVersion: 1;
    kind: 'plugin-compatibility-matrix';
    canaryVersion: string;
    scenario: string;
    pluginName: string;
    gitCommit: string;
    versions: string[];
    entries: PluginMatrixEntry[];
    compatible: number;
    incompatible: number;
    firstIncompatibleVersion?: string;
    createdAt: string;
    jsonArtifactPath?: string;
    markdownArtifactPath?: string;
}
export interface RunPluginMatrixOptions {
    cwd?: string;
    pluginPath: string;
    versions?: string[];
    from?: string;
    to?: string;
    last?: number;
    platform?: string;
    writeArtifacts?: boolean;
    onStatus?: (message: string) => void;
}
export declare function selectRecentPublishedVersions(publishedVersions: Iterable<string>, count: number): string[];
export declare function validateExplicitVersions(versions: string[]): string[];
export declare function resolvePluginMatrixVersions(options: Pick<RunPluginMatrixOptions, 'versions' | 'from' | 'to' | 'last'>): Promise<string[]>;
export declare function assertPluginMatrixCompatibleScenario(scenario: Scenario): void;
export declare function assertPluginTreeSafe(pluginRoot: string): Promise<void>;
export declare function formatPluginMatrixMarkdown(result: PluginMatrixResult): string;
export declare function runPluginMatrix(scenario: Scenario, options: RunPluginMatrixOptions): Promise<PluginMatrixResult>;
//# sourceMappingURL=plugin-matrix.d.ts.map