import { createHash } from 'node:crypto';
function normalizeText(value) {
    return value
        .replace(/\\/g, '/')
        .replace(/\b[0-9a-f]{7,40}\b/gi, '<sha>')
        .replace(/\b\d+(?:\.\d+)?\s*(?:ms|s|tokens?)\b/gi, '<metric>')
        .replace(/\s+/g, ' ')
        .trim();
}
export function classifyRunFailure(result) {
    if (result.passed)
        return 'passed';
    if (result.claudeTimedOut)
        return 'timeout';
    if (result.claudeExitCode !== 0)
        return 'claude-exit';
    return 'assertion';
}
export function fingerprintRun(result) {
    const payload = {
        category: classifyRunFailure(result),
        failures: result.failures.map(normalizeText).sort(),
        changedFiles: [...result.changedFiles].map((value) => value.replace(/\\/g, '/')).sort(),
        hookSequence: [...(result.metrics.hookEventSequence ?? result.metrics.hookEvents ?? [])],
        promptedTools: (result.metrics.permissionRequests ?? [])
            .map((request) => request.toolName ?? '<unknown>')
            .sort(),
    };
    const id = createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
    return { version: 1, id, ...payload };
}
export function clusterRunFailures(results) {
    const clusters = new Map();
    for (const result of results) {
        if (result.passed)
            continue;
        const fingerprint = fingerprintRun(result);
        const existing = clusters.get(fingerprint.id) ?? { fingerprint, count: 0, scenarios: new Set() };
        existing.count += 1;
        existing.scenarios.add(result.scenario);
        clusters.set(fingerprint.id, existing);
    }
    return [...clusters.values()]
        .map((cluster) => ({ ...cluster, scenarios: [...cluster.scenarios].sort() }))
        .sort((a, b) => b.count - a.count || a.fingerprint.id.localeCompare(b.fingerprint.id));
}
//# sourceMappingURL=fingerprint.js.map