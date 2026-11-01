import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
const PLUGIN_NAME_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
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
function normalize(value) {
    return value.split(path.sep).join('/');
}
function manifestPath(value, field) {
    if (!value.startsWith('./'))
        throw new Error(`plugin.json ${field} path must start with ./; received ${JSON.stringify(value)}.`);
    if (value.includes('\\'))
        throw new Error(`plugin.json ${field} path must use forward slashes; received ${JSON.stringify(value)}.`);
    if (value.split('/').includes('..'))
        throw new Error(`plugin.json ${field} path must not contain ..; received ${JSON.stringify(value)}.`);
    if (path.posix.isAbsolute(value))
        throw new Error(`plugin.json ${field} path must be relative; received ${JSON.stringify(value)}.`);
    return value.slice(2);
}
async function parseJsonValue(file, root) {
    try {
        return JSON.parse(await readFile(file, 'utf8'));
    }
    catch (error) {
        throw new Error(`Invalid JSON in ${normalize(path.relative(root, file))}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
function lspMap(value, label) {
    if (!isRecord(value))
        throw new Error(`${label} must contain a JSON object mapping LSP server names to configurations.`);
    const nested = value.lspServers;
    if (nested !== undefined) {
        if (!isRecord(nested))
            throw new Error(`${label} lspServers must be an object.`);
        return nested;
    }
    return value;
}
function validateStringArray(value, label) {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string'))
        throw new Error(`${label} must be an array of strings.`);
    return value;
}
function lspEntries(value, sourcePath, source) {
    return Object.entries(lspMap(value, sourcePath)).sort(([a], [b]) => a.localeCompare(b)).map(([name, raw]) => {
        if (!name.trim())
            throw new Error(`${sourcePath} contains an empty LSP server name.`);
        if (!isRecord(raw))
            throw new Error(`${sourcePath} LSP server ${name} must be an object.`);
        if (typeof raw.command !== 'string' || !raw.command.trim())
            throw new Error(`${sourcePath} LSP server ${name} is missing a non-empty command.`);
        if (!isRecord(raw.extensionToLanguage) || Object.keys(raw.extensionToLanguage).length === 0) {
            throw new Error(`${sourcePath} LSP server ${name} is missing extensionToLanguage.`);
        }
        for (const [extension, language] of Object.entries(raw.extensionToLanguage)) {
            if (!extension || typeof language !== 'string' || !language.trim()) {
                throw new Error(`${sourcePath} LSP server ${name} has an invalid extensionToLanguage entry.`);
            }
        }
        if (raw.args !== undefined)
            validateStringArray(raw.args, `${sourcePath} LSP server ${name} args`);
        if (raw.transport !== undefined && raw.transport !== 'stdio' && raw.transport !== 'socket') {
            throw new Error(`${sourcePath} LSP server ${name} transport must be stdio or socket.`);
        }
        if (raw.env !== undefined) {
            if (!isRecord(raw.env) || Object.values(raw.env).some((entry) => typeof entry !== 'string')) {
                throw new Error(`${sourcePath} LSP server ${name} env must be an object of strings.`);
            }
        }
        for (const field of ['startupTimeout', 'shutdownTimeout']) {
            if (raw[field] !== undefined && (typeof raw[field] !== 'number' || !Number.isFinite(raw[field]) || raw[field] < 0)) {
                throw new Error(`${sourcePath} LSP server ${name} ${field} must be a non-negative number.`);
            }
        }
        if (raw.restartOnCrash !== undefined && typeof raw.restartOnCrash !== 'boolean')
            throw new Error(`${sourcePath} LSP server ${name} restartOnCrash must be boolean.`);
        if (raw.maxRestarts !== undefined && (!Number.isInteger(raw.maxRestarts) || raw.maxRestarts < 0))
            throw new Error(`${sourcePath} LSP server ${name} maxRestarts must be a non-negative integer.`);
        if (raw.diagnostics !== undefined && typeof raw.diagnostics !== 'boolean')
            throw new Error(`${sourcePath} LSP server ${name} diagnostics must be boolean.`);
        return {
            kind: 'lsp',
            name,
            path: sourcePath,
            source,
            command: raw.command,
            extensions: Object.keys(raw.extensionToLanguage).sort(),
        };
    });
}
function addLsp(target, entry) {
    const existing = target.get(entry.name);
    if (existing && existing.path !== entry.path) {
        throw new Error(`Duplicate LSP server name discovered across plugin sources: ${entry.name} (${existing.path}, ${entry.path}).`);
    }
    if (!existing)
        target.set(entry.name, entry);
}
async function collectLsp(root, manifest) {
    const found = new Map();
    const defaultFile = path.join(root, '.lsp.json');
    if (await exists(defaultFile)) {
        for (const entry of lspEntries(await parseJsonValue(defaultFile, root), '.lsp.json', 'default'))
            addLsp(found, entry);
    }
    const spec = manifest.lspServers;
    if (spec === undefined)
        return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
    if (typeof spec === 'string' || (Array.isArray(spec) && spec.every((entry) => typeof entry === 'string'))) {
        const paths = typeof spec === 'string' ? [spec] : spec;
        for (const configured of paths) {
            const relative = manifestPath(configured, 'lspServers');
            const file = path.join(root, relative);
            if (!await exists(file))
                throw new Error(`plugin.json lspServers path does not exist: ./${normalize(relative)}`);
            for (const entry of lspEntries(await parseJsonValue(file, root), normalize(relative), 'manifest'))
                addLsp(found, entry);
        }
    }
    else if (isRecord(spec)) {
        for (const entry of lspEntries(spec, '.claude-plugin/plugin.json#lspServers', 'manifest'))
            addLsp(found, entry);
    }
    else {
        throw new Error('plugin.json lspServers must be a ./ path, array of ./ paths, or inline object.');
    }
    return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}
function monitorEntries(value, sourcePath, source) {
    if (!Array.isArray(value))
        throw new Error(`${sourcePath} must contain an array of monitor definitions.`);
    const names = new Set();
    return value.map((raw, index) => {
        if (!isRecord(raw))
            throw new Error(`${sourcePath} monitor at index ${index} must be an object.`);
        const { name, command, description, when } = raw;
        if (typeof name !== 'string' || !name.trim())
            throw new Error(`${sourcePath} monitor at index ${index} is missing name.`);
        if (names.has(name))
            throw new Error(`${sourcePath} contains duplicate monitor name: ${name}.`);
        names.add(name);
        if (typeof command !== 'string' || !command.trim())
            throw new Error(`${sourcePath} monitor ${name} is missing command.`);
        if (typeof description !== 'string' || !description.trim())
            throw new Error(`${sourcePath} monitor ${name} is missing description.`);
        if (when !== undefined && (typeof when !== 'string' || (!/^always$/.test(when) && !/^on-skill-invoke:.+/.test(when)))) {
            throw new Error(`${sourcePath} monitor ${name} has invalid when; use always or on-skill-invoke:<skill-name>.`);
        }
        return { name, path: sourcePath, source, command, description, when: when };
    }).sort((a, b) => a.name.localeCompare(b.name));
}
async function collectMonitors(root, manifest, warnings) {
    const experimental = isRecord(manifest.experimental) ? manifest.experimental.monitors : undefined;
    const legacy = manifest.monitors;
    if (legacy !== undefined)
        warnings.push('plugin.json top-level monitors is deprecated; prefer experimental.monitors.');
    const spec = experimental ?? legacy;
    if (spec === undefined) {
        const file = path.join(root, 'monitors', 'monitors.json');
        if (!await exists(file))
            return [];
        return monitorEntries(await parseJsonValue(file, root), 'monitors/monitors.json', 'default');
    }
    if (typeof spec === 'string' || (Array.isArray(spec) && spec.every((entry) => typeof entry === 'string'))) {
        const paths = typeof spec === 'string' ? [spec] : spec;
        const found = new Map();
        for (const configured of paths) {
            const relative = manifestPath(configured, 'experimental.monitors');
            const file = path.join(root, relative);
            if (!await exists(file))
                throw new Error(`plugin.json experimental.monitors path does not exist: ./${normalize(relative)}`);
            for (const entry of monitorEntries(await parseJsonValue(file, root), normalize(relative), 'manifest')) {
                if (found.has(entry.name))
                    throw new Error(`Duplicate monitor name discovered across plugin sources: ${entry.name}.`);
                found.set(entry.name, entry);
            }
        }
        return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
    }
    return monitorEntries(spec, '.claude-plugin/plugin.json#experimental.monitors', 'manifest');
}
function collectDependencies(manifest) {
    const value = manifest.dependencies;
    if (value === undefined)
        return [];
    if (!Array.isArray(value))
        throw new Error('plugin.json dependencies must be an array.');
    const found = new Map();
    for (const raw of value) {
        let dependency;
        if (typeof raw === 'string') {
            dependency = { name: raw };
        }
        else if (isRecord(raw)) {
            if (typeof raw.name !== 'string')
                throw new Error('plugin.json dependency object is missing name.');
            if (raw.version !== undefined && (typeof raw.version !== 'string' || !raw.version.trim()))
                throw new Error(`plugin.json dependency ${raw.name} version must be a non-empty string.`);
            if (raw.marketplace !== undefined && (typeof raw.marketplace !== 'string' || !raw.marketplace.trim()))
                throw new Error(`plugin.json dependency ${raw.name} marketplace must be a non-empty string.`);
            dependency = { name: raw.name, version: raw.version, marketplace: raw.marketplace };
        }
        else {
            throw new Error('plugin.json dependencies entries must be plugin names or dependency objects.');
        }
        if (!PLUGIN_NAME_RE.test(dependency.name))
            throw new Error(`plugin.json dependency name must be kebab-case; received ${JSON.stringify(dependency.name)}.`);
        const key = `${dependency.marketplace ?? ''}\u0000${dependency.name}`;
        const existing = found.get(key);
        if (existing && (existing.version !== dependency.version || existing.marketplace !== dependency.marketplace)) {
            throw new Error(`Conflicting duplicate plugin dependency: ${dependency.name}.`);
        }
        found.set(key, dependency);
    }
    return [...found.values()].sort((a, b) => (a.marketplace ?? '').localeCompare(b.marketplace ?? '') || a.name.localeCompare(b.name));
}
export async function discoverExtendedPluginSurfaces(root, manifest) {
    const warnings = [];
    return {
        lspServers: await collectLsp(root, manifest),
        monitors: await collectMonitors(root, manifest, warnings),
        dependencies: collectDependencies(manifest),
        warnings,
    };
}
//# sourceMappingURL=plugin-surfaces.js.map