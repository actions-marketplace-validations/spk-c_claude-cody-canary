import { z } from 'zod';
import { type CompatibilityManifest } from './compatibility.js';
export declare const SignedCompatibilityManifestSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    algorithm: z.ZodLiteral<"ed25519-sha256-canonical-json">;
    manifest: z.ZodObject<{
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
    manifestHash: z.ZodString;
    publicKeyFingerprint: z.ZodString;
    signature: z.ZodString;
}, z.core.$strict>;
export type SignedCompatibilityManifest = z.infer<typeof SignedCompatibilityManifestSchema>;
export interface SignedCompatibilityVerification {
    passed: boolean;
    manifestHash: string;
    publicKeyFingerprint?: string;
    failures: string[];
}
export declare function signCompatibilityManifest(manifestValue: CompatibilityManifest, privateKeyPem: string): SignedCompatibilityManifest;
export declare function verifySignedCompatibilityManifest(signedValue: SignedCompatibilityManifest, publicKeyPem: string): SignedCompatibilityVerification;
export declare function loadSignedCompatibilityManifest(file: string): Promise<SignedCompatibilityManifest>;
export declare function writeSignedCompatibilityManifest(file: string, signed: SignedCompatibilityManifest): Promise<void>;
export declare function runCompatibilitySignCli(args: string[]): Promise<void>;
export declare function runCompatibilityVerifyCli(args: string[]): Promise<void>;
//# sourceMappingURL=manifest-signing.d.ts.map