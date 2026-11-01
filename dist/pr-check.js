import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getRepoRoot } from './git.js';
import { formatComparisonMarkdown } from './comparison-markdown.js';
import { evaluateComparisonRegressions } from './regressions.js';
import { runScenario } from './runner.js';
function slug(value) {
    return value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72) || 'ref';
}
export async function runPrCheck(scenario, options = {}) {
    const cwd = options.cwd ?? process.cwd();
    const baseRef = options.baseRef ?? 'origin/main';
    const headRef = options.headRef ?? 'HEAD';
    const executable = options.executableOverride ?? scenario.claude.executable;
    const baseline = await runScenario(scenario, {
        cwd,
        executableOverride: executable,
        gitRefOverride: baseRef,
        allowDirtyWorkingTree: true,
        artifactLabel: `pr-base-${slug(baseRef)}`,
    });
    const candidate = await runScenario(scenario, {
        cwd,
        executableOverride: executable,
        gitRefOverride: headRef,
        allowDirtyWorkingTree: true,
        artifactLabel: `pr-head-${slug(headRef)}`,
    });
    const regressions = evaluateComparisonRegressions(scenario, baseline, candidate);
    const passed = candidate.passed && regressions.passed;
    const markdown = formatComparisonMarkdown(baseline, candidate, regressions, {
        title: 'Claude Code Canary — PR Regression Report',
        baselineLabel: 'Base',
        candidateLabel: 'PR',
        baselineRef: baseRef,
        candidateRef: headRef,
    });
    const repoRoot = await getRepoRoot(cwd);
    const resultsDir = path.join(repoRoot, '.canary', 'results');
    await mkdir(resultsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(resultsDir, `${stamp}-${slug(scenario.name)}-pr-check.md`);
    await writeFile(reportPath, markdown, 'utf8');
    return {
        schemaVersion: 1,
        scenario: scenario.name,
        baseRef,
        headRef,
        baseline,
        candidate,
        regressions,
        passed,
        reportPath,
    };
}
//# sourceMappingURL=pr-check.js.map