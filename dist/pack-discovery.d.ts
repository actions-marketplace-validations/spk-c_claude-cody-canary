import { z } from 'zod';
export declare const ScenarioPackDiscoverySchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"claude-code-canary-scenario-pack">;
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    capabilities: z.ZodObject<{
        network: z.ZodBoolean;
        mutating: z.ZodBoolean;
    }, z.core.$strict>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    authors: z.ZodDefault<z.ZodArray<z.ZodString>>;
    license: z.ZodOptional<z.ZodString>;
    repository: z.ZodOptional<z.ZodString>;
    homepage: z.ZodOptional<z.ZodString>;
    manifest: z.ZodLiteral<"canary-pack.yml">;
    manifestHash: z.ZodString;
    filesHash: z.ZodString;
    fileCount: z.ZodNumber;
}, z.core.$strict>;
export declare const ScenarioPackCatalogSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"claude-code-canary-scenario-pack-catalog">;
    packs: z.ZodArray<z.ZodObject<{
        schemaVersion: z.ZodLiteral<1>;
        kind: z.ZodLiteral<"claude-code-canary-scenario-pack">;
        name: z.ZodString;
        version: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        capabilities: z.ZodObject<{
            network: z.ZodBoolean;
            mutating: z.ZodBoolean;
        }, z.core.$strict>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
        authors: z.ZodDefault<z.ZodArray<z.ZodString>>;
        license: z.ZodOptional<z.ZodString>;
        repository: z.ZodOptional<z.ZodString>;
        homepage: z.ZodOptional<z.ZodString>;
        manifest: z.ZodLiteral<"canary-pack.yml">;
        manifestHash: z.ZodString;
        filesHash: z.ZodString;
        fileCount: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ScenarioPackDiscovery = z.infer<typeof ScenarioPackDiscoverySchema>;
export type ScenarioPackCatalog = z.infer<typeof ScenarioPackCatalogSchema>;
export interface ScenarioPackDiscoveryOptions {
    tags?: string[];
    authors?: string[];
    license?: string;
    repository?: string;
    homepage?: string;
}
export declare function buildScenarioPackDiscovery(root: string, options?: ScenarioPackDiscoveryOptions): Promise<ScenarioPackDiscovery>;
export declare function buildScenarioPackCatalog(entries: ScenarioPackDiscovery[]): ScenarioPackCatalog;
export declare function loadScenarioPackDiscovery(file: string): Promise<ScenarioPackDiscovery>;
export declare function runPackMetadataCli(args: string[]): Promise<void>;
export declare function runPackCatalogCli(args: string[]): Promise<void>;
//# sourceMappingURL=pack-discovery.d.ts.map