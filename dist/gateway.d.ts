import { z } from 'zod';
import { type SuiteRunResult } from './suite.js';
export declare const GatewayMatrixSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    name: z.ZodString;
    suite: z.ZodString;
    variants: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        env: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type GatewayMatrix = z.infer<typeof GatewayMatrixSchema>;
export interface GatewayMatrixResult {
    schemaVersion: 1;
    name: string;
    createdAt: string;
    passed: boolean;
    variants: Array<{
        name: string;
        envKeys: string[];
        passed: boolean;
        suite: SuiteRunResult;
    }>;
}
export declare function loadGatewayMatrix(file: string): Promise<GatewayMatrix>;
export declare function runGatewayMatrix(file: string, options?: {
    cwd?: string;
    executableOverride?: string;
    concurrency?: number;
}): Promise<GatewayMatrixResult>;
//# sourceMappingURL=gateway.d.ts.map