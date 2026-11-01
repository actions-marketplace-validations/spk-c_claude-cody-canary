import type { RunResult } from './types.js';
export interface FailureFingerprint {
    version: 1;
    id: string;
    category: 'passed' | 'timeout' | 'claude-exit' | 'assertion';
    failures: string[];
    changedFiles: string[];
    hookSequence: string[];
    promptedTools: string[];
}
export declare function classifyRunFailure(result: RunResult): FailureFingerprint['category'];
export declare function fingerprintRun(result: RunResult): FailureFingerprint;
export declare function clusterRunFailures(results: RunResult[]): Array<{
    fingerprint: FailureFingerprint;
    count: number;
    scenarios: string[];
}>;
//# sourceMappingURL=fingerprint.d.ts.map