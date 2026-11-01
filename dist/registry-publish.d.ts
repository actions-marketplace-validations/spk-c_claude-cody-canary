import { z } from 'zod';
import { type CompatibilityRegistry } from './compatibility.js';
export declare const StaticRegistryReleaseSchema: z.ZodObject<{
    claudeCode: z.ZodString;
    result: z.ZodEnum<{
        unsupported: "unsupported";
        pass: "pass";
        fail: "fail";
    }>;
    createdAt: z.ZodString;
    evidenceHash: z.ZodString;
    suiteHash: z.ZodString;
    manifestHash: z.ZodString;
    manifest: z.ZodString;
}, z.core.$strict>;
export declare const StaticRegistryComponentSchema: z.ZodObject<{
    component: z.ZodString;
    componentVersion: z.ZodOptional<z.ZodString>;
    platform: z.ZodString;
    releases: z.ZodArray<z.ZodObject<{
        claudeCode: z.ZodString;
        result: z.ZodEnum<{
            unsupported: "unsupported";
            pass: "pass";
            fail: "fail";
        }>;
        createdAt: z.ZodString;
        evidenceHash: z.ZodString;
        suiteHash: z.ZodString;
        manifestHash: z.ZodString;
        manifest: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const StaticRegistryIndexSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    registrySchemaVersion: z.ZodLiteral<1>;
    name: z.ZodString;
    generatedAt: z.ZodString;
    manifestCount: z.ZodNumber;
    registry: z.ZodLiteral<"registry.json">;
    checksumFile: z.ZodLiteral<"SHA256SUMS">;
    baseUrl: z.ZodOptional<z.ZodString>;
    components: z.ZodArray<z.ZodObject<{
        component: z.ZodString;
        componentVersion: z.ZodOptional<z.ZodString>;
        platform: z.ZodString;
        releases: z.ZodArray<z.ZodObject<{
            claudeCode: z.ZodString;
            result: z.ZodEnum<{
                unsupported: "unsupported";
                pass: "pass";
                fail: "fail";
            }>;
            createdAt: z.ZodString;
            evidenceHash: z.ZodString;
            suiteHash: z.ZodString;
            manifestHash: z.ZodString;
            manifest: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type StaticRegistryRelease = z.infer<typeof StaticRegistryReleaseSchema>;
export type StaticRegistryComponent = z.infer<typeof StaticRegistryComponentSchema>;
export type StaticRegistryIndex = z.infer<typeof StaticRegistryIndexSchema>;
export interface StaticRegistryPublishOptions {
    baseUrl?: string;
    html?: boolean;
}
export interface StaticRegistryPublishResult {
    schemaVersion: 1;
    outputDir: string;
    registryPath: string;
    indexPath: string;
    checksumPath: string;
    htmlPath?: string;
    manifestCount: number;
    componentCount: number;
    files: string[];
}
export declare function buildStaticRegistryIndex(registryValue: CompatibilityRegistry, options?: Pick<StaticRegistryPublishOptions, 'baseUrl'>): StaticRegistryIndex;
export declare function renderStaticRegistryHtml(indexValue: StaticRegistryIndex): string;
export declare function publishCompatibilityRegistry(registryFile: string, outputDirValue: string, options?: StaticRegistryPublishOptions): Promise<StaticRegistryPublishResult>;
export declare function runRegistryPublishCli(args: string[]): Promise<void>;
//# sourceMappingURL=registry-publish.d.ts.map