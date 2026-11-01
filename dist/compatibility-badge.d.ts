import { z } from 'zod';
import { type CompatibilityManifest } from './compatibility.js';
export declare const CompatibilityBadgeMetadataSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    component: z.ZodString;
    componentVersion: z.ZodOptional<z.ZodString>;
    claudeCode: z.ZodString;
    platform: z.ZodString;
    result: z.ZodEnum<{
        unsupported: "unsupported";
        pass: "pass";
        fail: "fail";
    }>;
    manifestHash: z.ZodString;
    evidenceHash: z.ZodString;
    suiteHash: z.ZodString;
    badge: z.ZodString;
    manifest: z.ZodString;
    evidenceUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type CompatibilityBadgeMetadata = z.infer<typeof CompatibilityBadgeMetadataSchema>;
export interface CompatibilityBadgeOptions {
    badgePath?: string;
    manifestPath?: string;
    evidenceUrl?: string;
}
export declare function renderCompatibilityBadgeSvg(manifestValue: CompatibilityManifest): string;
export declare function buildCompatibilityBadgeMetadata(manifestValue: CompatibilityManifest, options?: CompatibilityBadgeOptions): CompatibilityBadgeMetadata;
export declare function publishCompatibilityBadge(manifestFile: string, outputDirValue: string, options?: {
    baseUrl?: string;
    evidenceUrl?: string;
}): Promise<{
    outputDir: string;
    badgePath: string;
    metadataPath: string;
    markdownPath: string;
    manifestPath: string;
}>;
export declare function runCompatibilityBadgeCli(args: string[]): Promise<void>;
//# sourceMappingURL=compatibility-badge.d.ts.map