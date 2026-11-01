import type { SuiteRunResult } from './suite.js';
export interface SarifLog {
    version: '2.1.0';
    $schema: string;
    runs: Array<{
        tool: {
            driver: {
                name: string;
                informationUri: string;
                rules: Array<{
                    id: string;
                    shortDescription: {
                        text: string;
                    };
                }>;
            };
        };
        results: Array<{
            ruleId: string;
            level: 'error' | 'warning';
            message: {
                text: string;
            };
            properties?: Record<string, unknown>;
        }>;
    }>;
}
export declare function suiteToSarif(result: SuiteRunResult): SarifLog;
//# sourceMappingURL=sarif.d.ts.map