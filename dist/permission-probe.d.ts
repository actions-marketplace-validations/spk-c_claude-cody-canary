import type { Scenario } from './config.js';
import type { PermissionRequestTrace, RunMetrics } from './types.js';
export declare const PERMISSION_PROMPT_TOOL = "mcp__canary_permissions__permission_request";
export interface PermissionProbeMetrics {
    permissionPrompts: number;
    permissionDenied: number;
    permissionRequests: PermissionRequestTrace[];
}
export interface PreparedPermissionProbe {
    runtimeDir: string;
    extraClaudeArgs: string[];
    env: NodeJS.ProcessEnv;
    collect: () => Promise<PermissionProbeMetrics>;
    cleanup: () => Promise<void>;
}
export declare function needsPermissionProbe(scenario: Scenario): boolean;
export declare function preparePermissionProbe(scenario: Scenario): Promise<PreparedPermissionProbe | undefined>;
export declare function mergePermissionProbeMetrics(metrics: RunMetrics, probe: PermissionProbeMetrics | undefined): RunMetrics;
//# sourceMappingURL=permission-probe.d.ts.map