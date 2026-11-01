import { readFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod';
import { runSuite } from './suite.js';
const GatewayVariantSchema = z.object({
    name: z.string().min(1),
    env: z.record(z.string().min(1), z.string()).default({}),
    tags: z.array(z.string().min(1)).default([]),
}).strict();
export const GatewayMatrixSchema = z.object({
    schemaVersion: z.literal(1),
    name: z.string().min(1),
    suite: z.string().min(1),
    variants: z.array(GatewayVariantSchema).min(1),
}).strict();
function resolveEnvValue(value) {
    const match = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/.exec(value);
    if (!match)
        return value;
    const resolved = process.env[match[1]];
    if (resolved === undefined)
        throw new Error(`Gateway matrix requires environment variable ${match[1]}, but it is not set.`);
    return resolved;
}
export async function loadGatewayMatrix(file) {
    return GatewayMatrixSchema.parse(YAML.parse(await readFile(file, 'utf8')));
}
export async function runGatewayMatrix(file, options = {}) {
    const cwd = path.resolve(options.cwd ?? process.cwd());
    const matrix = await loadGatewayMatrix(path.resolve(cwd, file));
    const variants = [];
    for (const variant of matrix.variants) {
        const previous = new Map();
        try {
            for (const [key, configured] of Object.entries(variant.env)) {
                previous.set(key, process.env[key]);
                process.env[key] = resolveEnvValue(configured);
            }
            const suite = await runSuite(matrix.suite, {
                cwd,
                executableOverride: options.executableOverride,
                concurrency: options.concurrency,
                artifactLabel: `gateway-${variant.name}`,
            });
            variants.push({
                name: variant.name,
                envKeys: Object.keys(variant.env).sort(),
                passed: suite.passed,
                suite,
            });
        }
        finally {
            for (const [key, value] of previous) {
                if (value === undefined)
                    delete process.env[key];
                else
                    process.env[key] = value;
            }
        }
    }
    return {
        schemaVersion: 1,
        name: matrix.name,
        createdAt: new Date().toISOString(),
        passed: variants.every((variant) => variant.passed),
        variants,
    };
}
//# sourceMappingURL=gateway.js.map