import type { ComparisonRegressionResult } from './regressions.js';
import type { RunMetrics } from './types.js';
export interface ComparisonReportSubject {
    passed: boolean;
    failures: string[];
    metrics: RunMetrics;
    durationMs: number;
    gitCommit: string;
    executable: string;
}
export interface ComparisonMarkdownOptions {
    title?: string;
    baselineLabel?: string;
    candidateLabel?: string;
    baselineRef?: string;
    candidateRef?: string;
}
export declare function formatComparisonMarkdown(baseline: ComparisonReportSubject, candidate: ComparisonReportSubject, regressions: ComparisonRegressionResult, options?: ComparisonMarkdownOptions): string;
//# sourceMappingURL=comparison-markdown.d.ts.map