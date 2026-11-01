import * as openpgp from 'openpgp';
export declare const CLAUDE_CODE_SIGNING_FINGERPRINT = "31DDDE24DDFAB679F42D7BD2BAA929FF1A7ECACE";
export declare const FIRST_SIGNED_MANIFEST_VERSION = "2.1.89";
export type ManifestVerification = {
    mode: 'signed';
    fingerprint: string;
} | {
    mode: 'checksum-only';
    fingerprint: null;
};
export declare function manifestSignatureRequired(version: string): boolean;
export declare function readAndValidateSigningKey(armoredKey: string): Promise<openpgp.PublicKey>;
export declare function verifyDetachedManifestSignature(manifestBytes: Uint8Array, signatureBytes: Uint8Array, verificationKey: openpgp.PublicKey): Promise<void>;
export declare function verifyReleaseManifest(version: string, manifestBytes: Uint8Array, cacheRoot: string): Promise<ManifestVerification>;
//# sourceMappingURL=release-signature.d.ts.map