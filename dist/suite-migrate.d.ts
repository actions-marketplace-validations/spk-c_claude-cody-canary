import { type ScenarioSuite } from './suite.js';
export interface SuiteMigrationOptions {
    cwd?: string;
    source: string;
    output?: string;
    name?: string;
    inPlace?: boolean;
    backup?: boolean;
    force?: boolean;
    dryRun?: boolean;
}
export interface SuiteDefinitionMigration {
    suite: ScenarioSuite;
    changes: string[];
    changed: boolean;
    legacyDetected: boolean;
}
export interface SuiteMigrationResult extends SuiteDefinitionMigration {
    source: string;
    output: string;
    outputPath: string;
    backup?: string;
    backupPath?: string;
    yaml: string;
    written: boolean;
}
export declare function migrateSuiteDefinition(value: unknown, nameFallback?: string): SuiteDefinitionMigration;
export declare function migrateSuiteFile(options: SuiteMigrationOptions): Promise<SuiteMigrationResult>;
export declare function runSuiteMigrateCli(args: string[]): Promise<void>;
//# sourceMappingURL=suite-migrate.d.ts.map