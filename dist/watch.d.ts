import { z } from 'zod';
import { type SuiteRunResult } from './suite.js';
declare const WatchStateSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    lastObserved: z.ZodString;
    lastKnownGood: z.ZodString;
    updatedAt: z.ZodString;
    lastResult: z.ZodOptional<z.ZodEnum<{
        initialized: "initialized";
        compatible: "compatible";
        regression: "regression";
    }>>;
}, z.core.$strict>;
export type WatchState = z.infer<typeof WatchStateSchema>;
export type WatchStatus = 'initialized' | 'no-change' | 'new-release' | 'compatible' | 'regression';
export interface WatchOptions {
    cwd?: string;
    suitePath: string;
    statePath?: string;
    good?: string;
    platform?: string;
    checkOnly?: boolean;
    tag?: string;
    shard?: string;
    concurrency?: number;
    onStatus?: (message: string) => void;
    writeArtifacts?: boolean;
}
export interface WatchResult {
    schemaVersion: 1;
    status: WatchStatus;
    createdAt: string;
    previousObserved?: string;
    previousKnownGood?: string;
    latest: string;
    unseen: string[];
    candidate?: string;
    firstBadRelease?: string;
    firstFailingScenario?: string;
    suite?: SuiteRunResult;
    statePath: string;
    jsonArtifactPath?: string;
    markdownArtifactPath?: string;
}
declare function readState(file: string): Promise<WatchState | undefined>;
declare function formatWatchMarkdown(result: WatchResult): string;
export declare function watchClaudeCodeReleases(options: WatchOptions): Promise<WatchResult>;
export { formatWatchMarkdown, readState as readWatchState };
//# sourceMappingURL=watch.d.ts.map