import { z } from 'zod';
export declare const ScenarioPackSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    capabilities: z.ZodDefault<z.ZodObject<{
        network: z.ZodDefault<z.ZodBoolean>;
        mutating: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strict>>;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        sha256: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ScenarioPack = z.infer<typeof ScenarioPackSchema>;
export interface InspectedScenarioPack {
    root: string;
    manifest: ScenarioPack;
    verifiedFiles: string[];
}
export declare function inspectScenarioPack(root: string, options?: {
    allowUnsafe?: boolean;
}): Promise<InspectedScenarioPack>;
export declare function installScenarioPack(sourceRoot: string, targetRoot: string, options?: {
    allowUnsafe?: boolean;
    force?: boolean;
}): Promise<InspectedScenarioPack>;
//# sourceMappingURL=packs.d.ts.map