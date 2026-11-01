import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { parseSuite } from './suite.js';
const TOP_LEVEL_KEYS = new Set([
    'version',
    'name',
    'suite',
    'include',
    'includes',
    'files',
    'globs',
    'scenario_globs',
    'exclude',
    'excludes',
    'ignore',
    'tags',
    'scenarios',
    'concurrency',
    'parallel',
    'workers',
    'fail_fast',
    'failFast',
    'max_runs',
    'maxRuns',
    'reuse_results',
    'reuseResults',
]);
const SCENARIO_KEYS = new Set([
    'path',
    'file',
    'scenario',
    'tags',
    'affects',
    'always',
    'always_run',
    'alwaysRun',
]);
function normalizeRelative(value) {
    return value.split(path.sep).join('/');
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
async function exists(target) {
    try {
        await access(target);
        return true;
    }
    catch {
        return false;
    }
}
function assertInsideWorkspace(root, target, label) {
    const relative = path.relative(root, target);
    if (path.isAbsolute(relative) || relative === '..' || relative.startsWith(`..${path.sep}`)) {
        throw new Error(`${label} must stay inside the workspace: ${target}`);
    }
}
function unknownKeys(record, allowed, label) {
    const unknown = Object.keys(record).filter((key) => !allowed.has(key)).sort();
    if (unknown.length) {
        throw new Error(`${label} contains unsupported field(s): ${unknown.join(', ')}. Refusing to migrate without an explicit mapping.`);
    }
}
function stringList(value, label) {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            throw new Error(`${label} must not be empty.`);
        return [trimmed];
    }
    if (!Array.isArray(value))
        throw new Error(`${label} must be a string or string array.`);
    const result = value.map((item, index) => {
        if (typeof item !== 'string' || !item.trim())
            throw new Error(`${label}[${index}] must be a non-empty string.`);
        return item.trim();
    });
    return result;
}
function booleanValue(value, label) {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string' && ['true', 'false'].includes(value.trim().toLowerCase())) {
        return value.trim().toLowerCase() === 'true';
    }
    throw new Error(`${label} must be true or false.`);
}
function integerValue(value, label, min, max) {
    const parsed = typeof value === 'string' && value.trim() ? Number(value) : value;
    if (typeof parsed !== 'number' || !Number.isInteger(parsed) || parsed < min || parsed > max) {
        throw new Error(`${label} must be an integer from ${min} to ${max}.`);
    }
    return parsed;
}
function stringValue(value, label) {
    if (typeof value !== 'string' || !value.trim())
        throw new Error(`${label} must be a non-empty string.`);
    return value.trim();
}
function collectListAliases(record, aliases, canonical, changes) {
    const result = [];
    for (const key of aliases) {
        if (record[key] === undefined)
            continue;
        result.push(...stringList(record[key], key));
        if (key !== canonical)
            changes.push(`Renamed ${key} -> ${canonical}`);
    }
    return [...new Set(result)];
}
function resolveStringAliases(record, aliases, canonical, label, changes) {
    const found = aliases
        .filter((key) => record[key] !== undefined)
        .map((key) => ({ key, value: stringValue(record[key], key) }));
    if (!found.length)
        return undefined;
    const values = [...new Set(found.map((item) => item.value))];
    if (values.length > 1)
        throw new Error(`${label} has conflicting aliases: ${found.map((item) => item.key).join(', ')}.`);
    for (const item of found)
        if (item.key !== canonical)
            changes.push(`Renamed ${item.key} -> ${canonical}`);
    return values[0];
}
function resolveBooleanAliases(record, aliases, canonical, fallback, changes) {
    const found = aliases
        .filter((key) => record[key] !== undefined)
        .map((key) => ({ key, value: booleanValue(record[key], key) }));
    if (!found.length)
        return fallback;
    if (new Set(found.map((item) => item.value)).size > 1) {
        throw new Error(`${canonical} has conflicting aliases: ${found.map((item) => item.key).join(', ')}.`);
    }
    for (const item of found)
        if (item.key !== canonical)
            changes.push(`Renamed ${item.key} -> ${canonical}`);
    return found[0].value;
}
function resolveIntegerAliases(record, aliases, canonical, fallback, min, max, changes) {
    const found = aliases
        .filter((key) => record[key] !== undefined)
        .map((key) => ({ key, value: integerValue(record[key], key, min, max) }));
    if (!found.length)
        return fallback;
    if (new Set(found.map((item) => item.value)).size > 1) {
        throw new Error(`${canonical} has conflicting aliases: ${found.map((item) => item.key).join(', ')}.`);
    }
    for (const item of found)
        if (item.key !== canonical)
            changes.push(`Renamed ${item.key} -> ${canonical}`);
    return found[0].value;
}
function migrateScenarioEntry(value, index, changes) {
    if (typeof value === 'string') {
        const scenarioPath = value.trim();
        if (!scenarioPath)
            throw new Error(`scenarios[${index}] must not be empty.`);
        changes.push(`Converted scenarios[${index}] string -> { path }`);
        return { path: scenarioPath };
    }
    if (!isRecord(value))
        throw new Error(`scenarios[${index}] must be a path string or object.`);
    unknownKeys(value, SCENARIO_KEYS, `scenarios[${index}]`);
    const pathValue = resolveStringAliases(value, ['path', 'file', 'scenario'], 'path', `scenarios[${index}] path`, changes);
    if (!pathValue)
        throw new Error(`scenarios[${index}] needs path, file, or scenario.`);
    const result = { path: pathValue };
    if (value.tags !== undefined)
        result.tags = stringList(value.tags, `scenarios[${index}].tags`);
    if (value.affects !== undefined)
        result.affects = stringList(value.affects, `scenarios[${index}].affects`);
    const always = resolveBooleanAliases(value, ['always', 'always_run', 'alwaysRun'], 'always', false, changes);
    if (value.always !== undefined || value.always_run !== undefined || value.alwaysRun !== undefined)
        result.always = always;
    return result;
}
function fallbackSuiteName(source) {
    const base = path.basename(source)
        .replace(/\.ya?ml$/i, '')
        .replace(/\.suite$/i, '')
        .replace(/[^A-Za-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return base || 'release';
}
export function migrateSuiteDefinition(value, nameFallback = 'release') {
    try {
        const current = parseSuite(value);
        return { suite: current, changes: [], changed: false, legacyDetected: false };
    }
    catch {
        // Continue through the explicit legacy adapter. Unknown fields still fail closed below.
    }
    const changes = [];
    if (Array.isArray(value)) {
        const scenarios = value.map((item, index) => migrateScenarioEntry(item, index, changes));
        changes.unshift('Converted top-level scenario list -> suite object', 'Added version: 1', `Added name: ${nameFallback}`);
        return {
            suite: parseSuite({ version: 1, name: nameFallback, scenarios }),
            changes,
            changed: true,
            legacyDetected: true,
        };
    }
    if (!isRecord(value))
        throw new Error('Legacy suite must be a YAML object or a top-level scenario list.');
    unknownKeys(value, TOP_LEVEL_KEYS, 'Legacy suite');
    if (value.version === undefined) {
        changes.push('Added version: 1');
    }
    else {
        const version = integerValue(value.version, 'version', 0, 1);
        if (version === 0)
            changes.push('Upgraded version: 0 -> 1');
    }
    const name = resolveStringAliases(value, ['name', 'suite'], 'name', 'suite name', changes) ?? nameFallback;
    if (value.name === undefined && value.suite === undefined)
        changes.push(`Added name: ${name}`);
    const include = collectListAliases(value, ['include', 'includes', 'files', 'globs', 'scenario_globs'], 'include', changes);
    const exclude = collectListAliases(value, ['exclude', 'excludes', 'ignore'], 'exclude', changes);
    const tags = value.tags === undefined ? [] : stringList(value.tags, 'tags');
    let scenarios = [];
    if (value.scenarios !== undefined) {
        if (!Array.isArray(value.scenarios))
            throw new Error('scenarios must be an array.');
        scenarios = value.scenarios.map((item, index) => migrateScenarioEntry(item, index, changes));
    }
    const concurrency = resolveIntegerAliases(value, ['concurrency', 'parallel', 'workers'], 'concurrency', 1, 1, 32, changes);
    const failFast = resolveBooleanAliases(value, ['fail_fast', 'failFast'], 'fail_fast', false, changes);
    const maxRuns = resolveIntegerAliases(value, ['max_runs', 'maxRuns'], 'max_runs', 500, 1, 10_000, changes);
    const reuseResults = resolveBooleanAliases(value, ['reuse_results', 'reuseResults'], 'reuse_results', false, changes);
    const suite = parseSuite({
        version: 1,
        name,
        include,
        exclude,
        tags,
        scenarios,
        concurrency,
        fail_fast: failFast,
        max_runs: maxRuns,
        reuse_results: reuseResults,
    });
    return {
        suite,
        changes: [...new Set(changes)],
        changed: true,
        legacyDetected: true,
    };
}
function defaultOutputPath(sourcePath) {
    const replaced = sourcePath.replace(/(\.suite)?(\.ya?ml)$/i, '.migrated$1$2');
    return replaced === sourcePath ? `${sourcePath}.migrated.yml` : replaced;
}
export async function migrateSuiteFile(options) {
    const root = path.resolve(options.cwd ?? process.cwd());
    const sourcePath = path.resolve(root, options.source);
    assertInsideWorkspace(root, sourcePath, 'Suite source');
    if (!/\.ya?ml$/i.test(sourcePath))
        throw new Error('Suite source must use a .yml or .yaml extension.');
    if (!(await exists(sourcePath)))
        throw new Error(`Suite source does not exist: ${normalizeRelative(path.relative(root, sourcePath))}`);
    let parsed;
    try {
        parsed = YAML.parse(await readFile(sourcePath, 'utf8'));
    }
    catch (error) {
        throw new Error(`Could not parse YAML in ${options.source}: ${error instanceof Error ? error.message : String(error)}`);
    }
    let migration = migrateSuiteDefinition(parsed, options.name?.trim() || fallbackSuiteName(sourcePath));
    if (options.name?.trim() && migration.suite.name !== options.name.trim()) {
        const suite = parseSuite({ ...migration.suite, name: options.name.trim() });
        migration = {
            ...migration,
            suite,
            changes: [...migration.changes, `Set name: ${options.name.trim()}`],
            changed: true,
        };
    }
    if (options.inPlace && options.output)
        throw new Error('Use either --in-place or --output, not both.');
    const outputPath = options.inPlace
        ? sourcePath
        : path.resolve(root, options.output?.trim() || defaultOutputPath(sourcePath));
    assertInsideWorkspace(root, outputPath, 'Suite output');
    if (!/\.ya?ml$/i.test(outputPath))
        throw new Error('Suite output must use a .yml or .yaml extension.');
    if (!options.inPlace && outputPath === sourcePath)
        throw new Error('Use --in-place to replace the source suite.');
    const shouldWrite = !options.dryRun && (!options.inPlace || migration.changed);
    const useBackup = options.inPlace && migration.changed && (options.backup ?? true);
    const backupPath = useBackup ? `${sourcePath}.bak` : undefined;
    if (!options.inPlace && await exists(outputPath) && !options.force) {
        throw new Error(`Suite output already exists: ${normalizeRelative(path.relative(root, outputPath))}. Use --force to replace it.`);
    }
    if (backupPath) {
        assertInsideWorkspace(root, backupPath, 'Suite backup');
        if (await exists(backupPath) && !options.force) {
            throw new Error(`Suite backup already exists: ${normalizeRelative(path.relative(root, backupPath))}. Use --force to replace it.`);
        }
    }
    const yaml = `# Migrated by claude-canary suite migrate\n${YAML.stringify(migration.suite)}`;
    if (shouldWrite) {
        await mkdir(path.dirname(outputPath), { recursive: true });
        if (backupPath)
            await copyFile(sourcePath, backupPath);
        await writeFile(outputPath, yaml, 'utf8');
    }
    return {
        ...migration,
        source: normalizeRelative(path.relative(root, sourcePath)),
        output: normalizeRelative(path.relative(root, outputPath)),
        outputPath,
        backup: backupPath ? normalizeRelative(path.relative(root, backupPath)) : undefined,
        backupPath,
        yaml,
        written: shouldWrite,
    };
}
function suiteMigrateHelp() {
    return `Migrate a legacy Canary suite to the current validated suite layout.\n\n` +
        `Usage:\n` +
        `  claude-canary suite migrate <legacy-suite.yml> [options]\n\n` +
        `Options:\n` +
        `  --output <file>       Write to an explicit output file\n` +
        `  --in-place            Replace the source after creating a .bak backup\n` +
        `  --no-backup           With --in-place, do not create a backup\n` +
        `  --name <name>         Override the migrated suite name\n` +
        `  --force               Replace an existing output or backup\n` +
        `  --dry-run             Print migrated YAML without writing files\n` +
        `  --json                Print the migration result as JSON\n` +
        `  --help                Show this help\n`;
}
function parseCliArgs(args) {
    const source = args[0];
    if (!source || source.startsWith('-'))
        throw new Error('suite migrate requires a legacy suite file.');
    let output;
    let name;
    let inPlace = false;
    let backup = true;
    let force = false;
    let dryRun = false;
    let json = false;
    for (let index = 1; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--output' || arg === '--name') {
            const value = args[index + 1];
            if (!value || value.startsWith('-'))
                throw new Error(`${arg} requires a value.`);
            if (arg === '--output')
                output = value;
            else
                name = value;
            index += 1;
            continue;
        }
        if (arg === '--in-place') {
            inPlace = true;
            continue;
        }
        if (arg === '--no-backup') {
            backup = false;
            continue;
        }
        if (arg === '--force') {
            force = true;
            continue;
        }
        if (arg === '--dry-run') {
            dryRun = true;
            continue;
        }
        if (arg === '--json') {
            json = true;
            continue;
        }
        throw new Error(`Unknown suite migrate option: ${arg}`);
    }
    if (inPlace && output)
        throw new Error('Use either --in-place or --output, not both.');
    if (!inPlace && !backup)
        throw new Error('--no-backup is only valid with --in-place.');
    return { source, output, name, inPlace, backup, force, dryRun, json };
}
export async function runSuiteMigrateCli(args) {
    if (args.includes('--help') || args.includes('-h')) {
        console.log(suiteMigrateHelp());
        return;
    }
    const parsed = parseCliArgs(args);
    const result = await migrateSuiteFile({
        cwd: process.cwd(),
        source: parsed.source,
        output: parsed.output,
        name: parsed.name,
        inPlace: parsed.inPlace,
        backup: parsed.backup,
        force: parsed.force,
        dryRun: parsed.dryRun,
    });
    if (parsed.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    if (parsed.dryRun) {
        console.log(result.yaml);
        console.error(`${result.changed ? 'Migration required' : 'Suite is already current'}. No file written.`);
        return;
    }
    if (!result.written) {
        console.log(`Already current: ${result.source}`);
        return;
    }
    console.log(`Migrated ${result.source} -> ${result.output}`);
    if (result.backup)
        console.log(`Backup: ${result.backup}`);
    for (const change of result.changes)
        console.log(`- ${change}`);
    console.log(`Next: claude-canary suite ${result.output} --list`);
}
//# sourceMappingURL=suite-migrate.js.map