import { type CompatibilityManifest } from './compatibility.js';
export type CompatibilityArtifactKind = 'manifest' | 'registry' | 'lock' | 'unknown';
export type EvidenceDiagnosticSeverity = 'error' | 'warning' | 'info';
export interface EvidenceDiagnostic {
    code: string;
    severity: EvidenceDiagnosticSeverity;
    path?: string;
    message: string;
    fix?: string;
}
export interface CompatibilityDiagnosticOptions {
    now?: Date;
    maxAgeDays?: number;
    expectedClaudeCode?: string;
    expectedPlatform?: string;
    expectedComponent?: string;
    expectedComponentVersion?: string;
    evidence?: unknown;
    suiteDefinition?: unknown;
    manifests?: CompatibilityManifest[];
}
export interface CompatibilityDiagnosticResult {
    schemaVersion: 1;
    file?: string;
    kind: CompatibilityArtifactKind;
    valid: boolean;
    stale: boolean;
    passed: boolean;
    summary: string;
    diagnostics: EvidenceDiagnostic[];
}
export declare function detectCompatibilityArtifactKind(value: unknown): CompatibilityArtifactKind;
export declare function diagnoseCompatibilityArtifact(value: unknown, options?: CompatibilityDiagnosticOptions): CompatibilityDiagnosticResult;
export declare function diagnoseCompatibilityFile(file: string, options?: CompatibilityDiagnosticOptions): Promise<CompatibilityDiagnosticResult>;
export declare function formatCompatibilityDiagnostics(result: CompatibilityDiagnosticResult): string;
export declare function runCompatibilityDiagnoseCli(args: string[]): Promise<void>;
//# sourceMappingURL=compatibility-diagnostics.d.ts.map