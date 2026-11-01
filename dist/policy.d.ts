import { z } from 'zod';
import type { RunMetrics } from './types.js';
export declare const PermissionPolicySchema: z.ZodObject<{
    never_auto_allow: z.ZodDefault<z.ZodArray<z.ZodString>>;
    require_prompt: z.ZodDefault<z.ZodArray<z.ZodString>>;
    deny_use: z.ZodDefault<z.ZodArray<z.ZodString>>;
    allow_only: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type PermissionPolicy = z.infer<typeof PermissionPolicySchema>;
export interface PermissionPolicyCoverage {
    usedTools: string[];
    promptedTools: string[];
    autoAllowedTools: string[];
    deniedCount: number;
    neverExercised: string[];
}
export interface PermissionPolicyEvaluation {
    passed: boolean;
    failures: string[];
    coverage: PermissionPolicyCoverage;
}
export declare function evaluatePermissionPolicy(stdout: string, metrics: RunMetrics, policy: PermissionPolicy): PermissionPolicyEvaluation;
//# sourceMappingURL=policy.d.ts.map