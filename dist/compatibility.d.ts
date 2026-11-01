import { z } from 'zod';
export declare const CompatibilityManifestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    canaryVersion: z.ZodString;
    claudeCode: z.ZodString;
    component: z.ZodString;
    componentVersion: z.ZodOptional<z.ZodString>;
    platform: z.ZodString;
    suiteHash: z.ZodString;
    result: z.ZodEnum<{
        unsupported: "unsupported";
        pass: "pass";
        fail: "fail";
    }>;
    createdAt: z.ZodString;
    evidenceHash: z.ZodString;
    failureFingerprints: z.ZodDefault<z.ZodArray<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strict>;
export type CompatibilityManifest = z.infer<typeof CompatibilityManifestSchema>;
export declare const CanaryLockSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    canaryVersion: z.ZodString;
    claudeCode: z.ZodString;
    platform: z.ZodString;
    suites: z.ZodArray<z.ZodObject<{
        component: z.ZodString;
        componentVersion: z.ZodOptional<z.ZodString>;
        suiteHash: z.ZodString;
        evidenceHash: z.ZodString;
    }, z.core.$strict>>;
    generatedAt: z.ZodString;
}, z.core.$strict>;
export type CanaryLock = z.infer<typeof CanaryLockSchema>;
export declare const CompatibilityRegistrySchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    name: z.ZodString;
    generatedAt: z.ZodString;
    manifests: z.ZodArray<z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        canaryVersion: z.ZodString;
        claudeCode: z.ZodString;
        component: z.ZodString;
        componentVersion: z.ZodOptional<z.ZodString>;
        platform: z.ZodString;
        suiteHash: z.ZodString;
        result: z.ZodEnum<{
            unsupported: "unsupported";
            pass: "pass";
            fail: "fail";
        }>;
        createdAt: z.ZodString;
        evidenceHash: z.ZodString;
        failureFingerprints: z.ZodDefault<z.ZodArray<z.ZodString>>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type CompatibilityRegistry = z.infer<typeof CompatibilityRegistrySchema>;
export declare function sha256Canonical(value: unknown): string;
export declare function createCompatibilityManifest(input: {
    claudeCode: string;
    component: string;
    componentVersion?: string;
    platform: string;
    suiteDefinition: unknown;
    result: CompatibilityManifest['result'];
    evidence: unknown;
    failureFingerprints?: string[];
    metadata?: Record<string, string>;
    canaryVersion?: string;
}): CompatibilityManifest;
export declare function writeCompatibilityManifest(file: string, manifest: CompatibilityManifest): Promise<void>;
export declare function loadCompatibilityManifest(file: string): Promise<CompatibilityManifest>;
export declare function loadCompatibilityRegistry(file: string): Promise<CompatibilityRegistry>;
export declare function writeCompatibilityRegistry(file: string, registry: CompatibilityRegistry): Promise<void>;
export declare function createCanaryLock(manifests: CompatibilityManifest[]): CanaryLock;
export declare function writeCanaryLock(file: string, lock: CanaryLock): Promise<void>;
export declare function loadCanaryLock(file: string): Promise<CanaryLock>;
export declare function checkCanaryLock(lock: CanaryLock, current: {
    claudeCode: string;
    platform: string;
    manifests?: CompatibilityManifest[];
}): {
    passed: boolean;
    failures: string[];
};
export declare function mergeCompatibilityRegistries(name: string, registries: CompatibilityRegistry[]): CompatibilityRegistry;
export declare function aggregateRegistryFiles(name: string, files: string[]): Promise<CompatibilityRegistry>;
export interface CompatibilityQuery {
    component?: string;
    componentVersion?: string;
    platform?: string;
    claudeCode?: string;
    result?: CompatibilityManifest['result'];
}
export declare function queryCompatibility(registry: CompatibilityRegistry, query: CompatibilityQuery): CompatibilityManifest[];
export declare function compareVersion(a: string, b: string): number;
export declare function newestKnownGood(registry: CompatibilityRegistry, query: Omit<CompatibilityQuery, 'claudeCode' | 'result'>): CompatibilityManifest | undefined;
export declare function firstKnownBad(registry: CompatibilityRegistry, query: Omit<CompatibilityQuery, 'claudeCode' | 'result'>, from?: string, to?: string): CompatibilityManifest | undefined;
export interface CompatibilityExplanation {
    component: string;
    from?: string;
    to?: string;
    tested: CompatibilityManifest[];
    newestGood?: CompatibilityManifest;
    firstBad?: CompatibilityManifest;
    status: 'no-evidence' | 'compatible' | 'regression-known' | 'mixed';
    evidenceHashes: string[];
    failureFingerprints: string[];
}
export declare function explainCompatibility(registry: CompatibilityRegistry, query: Omit<CompatibilityQuery, 'claudeCode' | 'result'> & {
    component: string;
}, from?: string, to?: string): CompatibilityExplanation;
export interface CompatibilityGraph {
    nodes: Array<{
        id: string;
        kind: 'component' | 'claude-code' | 'platform' | 'canary';
        label: string;
    }>;
    edges: Array<{
        from: string;
        to: string;
        result: CompatibilityManifest['result'];
        evidenceHash: string;
    }>;
}
export declare function buildCompatibilityGraph(registry: CompatibilityRegistry): CompatibilityGraph;
export declare function compatibilityBadgeMarkdown(manifest: CompatibilityManifest): string;
//# sourceMappingURL=compatibility.d.ts.map