import { z } from 'zod';
import { type CompatibilityQuery, type CompatibilityRegistry } from './compatibility.js';
export declare const RegistryExchangeConflictSchema: z.ZodObject<{
    identity: z.ZodString;
    kind: z.ZodEnum<{
        result: "result";
        evidence: "evidence";
    }>;
    manifestHashes: z.ZodArray<z.ZodString>;
    results: z.ZodArray<z.ZodEnum<{
        unsupported: "unsupported";
        pass: "pass";
        fail: "fail";
    }>>;
}, z.core.$strict>;
export type RegistryExchangeConflict = z.infer<typeof RegistryExchangeConflictSchema>;
export interface RegistryImportResult {
    registry: CompatibilityRegistry;
    conflicts: RegistryExchangeConflict[];
    added: number;
    duplicates: number;
}
export declare function exportCompatibilityRegistry(registryValue: CompatibilityRegistry, query?: CompatibilityQuery, options?: {
    name?: string;
}): CompatibilityRegistry;
export declare function importCompatibilityRegistries(baseValue: CompatibilityRegistry, incomingValues: CompatibilityRegistry[], options?: {
    name?: string;
    allowResultConflicts?: boolean;
}): RegistryImportResult;
export declare function runRegistryExportCli(args: string[]): Promise<void>;
export declare function runRegistryImportCli(args: string[]): Promise<void>;
//# sourceMappingURL=registry-exchange.d.ts.map