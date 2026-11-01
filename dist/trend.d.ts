export interface TrendPoint {
    release?: string;
    scenario: string;
    createdAt: string;
    passed: boolean;
    totalTokens: number;
    toolCalls: number;
    durationMs: number;
    fingerprint?: string;
}
export interface TrendSummary {
    schemaVersion: 1;
    createdAt: string;
    points: number;
    passRate: number;
    totalTokens: {
        median: number;
        p95: number;
    };
    toolCalls: {
        median: number;
        p95: number;
    };
    durationMs: {
        median: number;
        p95: number;
    };
    repeatedFingerprints: Array<{
        id: string;
        count: number;
    }>;
    releases: Array<{
        release: string;
        runs: number;
        passRate: number;
    }>;
    timeline: TrendPoint[];
}
export declare function loadTrendPoints(directory: string): Promise<TrendPoint[]>;
export declare function summarizeTrends(points: TrendPoint[]): TrendSummary;
export declare function formatTrendMarkdown(summary: TrendSummary): string;
//# sourceMappingURL=trend.d.ts.map