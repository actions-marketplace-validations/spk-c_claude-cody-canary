import type { Scenario } from './config.js';
import type { RunMetrics } from './types.js';
export interface ComparisonRegressionResult {
    passed: boolean;
    failures: string[];
}
export interface RegressionComparable {
    metrics: RunMetrics;
}
export declare function evaluateComparisonRegressions(scenario: Scenario, baseline: RegressionComparable, candidate: RegressionComparable): ComparisonRegressionResult;
//# sourceMappingURL=regressions.d.ts.map