import { type CanaryLock, type CompatibilityManifest } from './compatibility.js';
export type CompatibilityDiffImpact = 'none' | 'informational' | 'evidence' | 'compatibility' | 'regression';
export type CompatibilityDiffKind = 'lock' | 'manifest';
export interface CompatibilityDiffChange {
    path: string;
    kind: 'tooling' | 'release' | 'platform' | 'component-added' | 'component-removed' | 'component-version' | 'suite-definition' | 'evidence' | 'result' | 'failure-fingerprints' | 'metadata';
    impact: Exclude<CompatibilityDiffImpact, 'none'>;
    component?: string;
    before?: unknown;
    after?: unknown;
    explanation: string;
}
export interface CompatibilityDiffResult {
    schemaVersion: 1;
    kind: CompatibilityDiffKind;
    changed: boolean;
    impact: CompatibilityDiffImpact;
    summary: string;
    ignoredFields: string[];
    changes: CompatibilityDiffChange[];
}
export declare function diffCanaryLocks(before: CanaryLock, after: CanaryLock): CompatibilityDiffResult;
export declare function diffCompatibilityManifests(before: CompatibilityManifest, after: CompatibilityManifest): CompatibilityDiffResult;
export declare function formatCompatibilityDiff(result: CompatibilityDiffResult): string;
export declare function runCompatibilityDiffCli(kind: CompatibilityDiffKind, args: string[]): Promise<void>;
//# sourceMappingURL=compatibility-diff.d.ts.map