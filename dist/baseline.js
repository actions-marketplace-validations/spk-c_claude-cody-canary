import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadScenario } from './config.js';
import { formatComparisonMarkdown } from './comparison-markdown.js';
import { getRepoRoot } from './git.js';
import { evaluateComparisonRegressions } from './regressions.js';
import { runScenario } from './runner.js';
function slug(value) {
    return value.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'scenario';
}
function sha256(text) {
    return createHash('sha256').update(text, 'utf8').digest('hex');
}
function portableRelative(root, file) {
    return path.relative(root, file).split(path.sep).join('/');
}
function repositoryRelative(root, file, label) {
    const relative = path.relative(root, file);
    if (!relative || relative === '.')
        throw new Error(`${label} must be a file inside the Git repository.`);
    if (path.isAbsolute(relative) || relative === '..' || relative.startsWith(`..${path.sep}`)) {
        throw new Error(`${label} must be inside the Git repository.`);
    }
    return relative.split(path.sep).join('/');
}
function nonnegativeFinite(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
function optionalNonnegativeFinite(value) {
    return value === undefined || nonnegativeFinite(value);
}
function optionalStringArray(value) {
    return value === undefined || (Array.isArray(value) && value.every((entry) => typeof entry === 'string'));
}
function isMetrics(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const metrics = value;
    const requiredNumbers = [
        metrics.toolCalls,
        metrics.inputTokens,
        metrics.outputTokens,
        metrics.cacheReadTokens,
        metrics.cacheCreationTokens,
        metrics.totalTokens,
        metrics.parseErrors,
    ];
    if (!requiredNumbers.every(nonnegativeFinite))
        return false;
    if (!Number.isInteger(metrics.toolCalls) || !Number.isInteger(metrics.parseErrors))
        return false;
    if (!Array.isArray(metrics.hookEvents) || !metrics.hookEvents.every((entry) => typeof entry === 'string'))
        return false;
    if (!optionalStringArray(metrics.hookEventSequence))
        return false;
    if (!optionalNonnegativeFinite(metrics.costUsd) || !optionalNonnegativeFinite(metrics.turns))
        return false;
    if (metrics.permissionPrompts !== undefined && (!Number.isInteger(metrics.permissionPrompts) || metrics.permissionPrompts < 0))
        return false;
    if (metrics.permissionDenied !== undefined && (!Number.isInteger(metrics.permissionDenied) || metrics.permissionDenied < 0))
        return false;
    if (metrics.permissionRequests !== undefined) {
        if (!Array.isArray(metrics.permissionRequests))
            return false;
        for (const request of metrics.permissionRequests) {
            if (!request || typeof request !== 'object' || Array.isArray(request))
                return false;
            for (const key of ['toolName', 'toolUseId', 'permissionMode']) {
                if (request[key] !== undefined && typeof request[key] !== 'string')
                    return false;
            }
        }
    }
    return true;
}
function parseBaselineSnapshot(value, baselinePath) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`${baselinePath} is not a Canary baseline object.`);
    const candidate = value;
    if (candidate.schemaVersion !== 1 || candidate.scenarioSchemaVersion !== 1) {
        throw new Error(`${baselinePath} uses an unsupported baseline schema version.`);
    }
    for (const key of ['scenario', 'sourceScenario', 'createdAt', 'executable']) {
        if (typeof candidate[key] !== 'string' || candidate[key] === '')
            throw new Error(`${baselinePath} is missing ${key}.`);
    }
    if (typeof candidate.scenarioHash !== 'string' || !/^[0-9a-f]{64}$/i.test(candidate.scenarioHash)) {
        throw new Error(`${baselinePath} has an invalid scenarioHash.`);
    }
    if (typeof candidate.gitCommit !== 'string' || !/^[0-9a-f]{40}$/i.test(candidate.gitCommit)) {
        throw new Error(`${baselinePath} has an invalid gitCommit.`);
    }
    if (!nonnegativeFinite(candidate.durationMs))
        throw new Error(`${baselinePath} has an invalid durationMs.`);
    if (!isMetrics(candidate.metrics))
        throw new Error(`${baselinePath} has invalid run metrics.`);
    return candidate;
}
async function scenarioContext(scenarioPath, cwd) {
    const repoRoot = await getRepoRoot(cwd);
    const resolved = path.resolve(cwd, scenarioPath);
    const sourceScenario = repositoryRelative(repoRoot, resolved, 'Scenario');
    const source = await readFile(resolved, 'utf8');
    const scenario = await loadScenario(resolved);
    return { scenario, resolved, source, hash: sha256(source), repoRoot, sourceScenario };
}
export function defaultBaselinePath(repoRoot, scenarioName) {
    return path.join(repoRoot, '.canary', 'baselines', `${slug(scenarioName)}.json`);
}
export async function updateBaseline(scenarioPath, options = {}) {
    const cwd = options.cwd ?? process.cwd();
    const context = await scenarioContext(scenarioPath, cwd);
    const run = await runScenario(context.scenario, {
        cwd,
        executableOverride: options.executableOverride,
        artifactLabel: 'baseline-update',
    });
    if (!run.passed) {
        throw new Error(`Refusing to save a failing baseline for ${context.scenario.name}: ${run.failures.join('; ') || 'run failed'}`);
    }
    const snapshot = {
        schemaVersion: 1,
        scenarioSchemaVersion: 1,
        scenario: context.scenario.name,
        sourceScenario: context.sourceScenario,
        scenarioHash: context.hash,
        createdAt: new Date().toISOString(),
        gitCommit: run.gitCommit,
        executable: run.executable,
        durationMs: run.durationMs,
        metrics: run.metrics,
    };
    const baselinePath = options.output ? path.resolve(cwd, options.output) : defaultBaselinePath(context.repoRoot, context.scenario.name);
    repositoryRelative(context.repoRoot, baselinePath, 'Baseline output');
    await mkdir(path.dirname(baselinePath), { recursive: true });
    await writeFile(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    return { baselinePath, snapshot, run };
}
export async function loadBaseline(file) {
    const text = await readFile(file, 'utf8');
    let value;
    try {
        value = JSON.parse(text);
    }
    catch {
        throw new Error(`${file} is not valid JSON.`);
    }
    return parseBaselineSnapshot(value, file);
}
function snapshotSubject(snapshot) {
    return {
        passed: true,
        failures: [],
        metrics: snapshot.metrics,
        durationMs: snapshot.durationMs,
        gitCommit: snapshot.gitCommit,
        executable: snapshot.executable,
    };
}
export async function checkBaseline(scenarioPath, options = {}) {
    const cwd = options.cwd ?? process.cwd();
    const context = await scenarioContext(scenarioPath, cwd);
    const baselinePath = options.baseline
        ? path.resolve(cwd, options.baseline)
        : defaultBaselinePath(context.repoRoot, context.scenario.name);
    repositoryRelative(context.repoRoot, baselinePath, 'Baseline');
    const baseline = await loadBaseline(baselinePath);
    if (baseline.scenario !== context.scenario.name) {
        throw new Error(`Baseline scenario mismatch: ${baseline.scenario} != ${context.scenario.name}.`);
    }
    if (baseline.sourceScenario !== context.sourceScenario) {
        throw new Error(`Baseline source mismatch: ${baseline.sourceScenario} != ${context.sourceScenario}. Refresh the baseline for this scenario path.`);
    }
    if (baseline.scenarioHash !== context.hash) {
        throw new Error(`Baseline ${portableRelative(context.repoRoot, baselinePath)} is stale because the scenario file changed. Run claude-canary baseline update ${scenarioPath}.`);
    }
    const candidate = await runScenario(context.scenario, {
        cwd,
        executableOverride: options.executableOverride,
        gitRefOverride: options.gitRefOverride ?? 'HEAD',
        allowDirtyWorkingTree: options.gitRefOverride !== undefined,
        artifactLabel: 'baseline-check',
    });
    const comparable = snapshotSubject(baseline);
    const regressions = evaluateComparisonRegressions(context.scenario, comparable, candidate);
    const passed = candidate.passed && regressions.passed;
    const markdown = formatComparisonMarkdown(comparable, candidate, regressions, {
        title: 'Claude Code Canary — Baseline Regression Report',
        baselineLabel: 'Saved baseline',
        candidateLabel: 'Current run',
        baselineRef: baseline.gitCommit.slice(0, 12),
        candidateRef: candidate.gitCommit.slice(0, 12),
    });
    const resultsDir = path.join(context.repoRoot, '.canary', 'results');
    await mkdir(resultsDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(resultsDir, `${stamp}-${slug(context.scenario.name)}-baseline-check.md`);
    await writeFile(reportPath, markdown, 'utf8');
    return {
        schemaVersion: 1,
        scenario: context.scenario.name,
        baselinePath,
        baseline,
        candidate,
        regressions,
        passed,
        reportPath,
    };
}
//# sourceMappingURL=baseline.js.map