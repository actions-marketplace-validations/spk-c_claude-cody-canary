import { z } from 'zod';
import type { RunResult } from './types.js';
export declare const LifecycleTrustPolicySchema: z.ZodObject<{
    require_events: z.ZodDefault<z.ZodArray<z.ZodString>>;
    forbid_events: z.ZodDefault<z.ZodArray<z.ZodString>>;
    deny_unexpected: z.ZodDefault<z.ZodBoolean>;
    max_occurrences: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, z.core.$strict>;
export type LifecycleTrustPolicy = z.infer<typeof LifecycleTrustPolicySchema>;
export interface LifecycleTrustResult {
    passed: boolean;
    failures: string[];
    observedSequence: string[];
    counts: Record<string, number>;
}
export declare function evaluateLifecycleTrust(result: RunResult, policy: LifecycleTrustPolicy): LifecycleTrustResult;
export interface TrustSurfaceDiff {
    passed: boolean;
    newHookEvents: string[];
    removedHookEvents: string[];
    newToolNames: string[];
    removedToolNames: string[];
    newAutoAllowedTools: string[];
}
export declare function compareTrustSurfaces(baseline: RunResult, candidate: RunResult): TrustSurfaceDiff;
//# sourceMappingURL=trust.d.ts.map