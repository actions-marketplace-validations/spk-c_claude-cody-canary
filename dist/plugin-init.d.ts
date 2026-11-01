import { type PluginDependency, type PluginLspServer, type PluginMonitor } from './plugin-surfaces.js';
export type PluginComponentKind = 'command' | 'agent' | 'skill' | 'hook' | 'mcp' | 'lsp';
export interface PluginComponent {
    kind: PluginComponentKind;
    name: string;
    path: string;
    source: 'default' | 'manifest';
    description?: string;
}
export interface PluginDiscovery {
    schemaVersion: 1;
    pluginName: string;
    pluginRoot: string;
    manifestPath: string;
    commands: PluginComponent[];
    agents: PluginComponent[];
    skills: PluginComponent[];
    hooks: PluginComponent[];
    mcpServers: PluginComponent[];
    lspServers: PluginLspServer[];
    monitors: PluginMonitor[];
    dependencies: PluginDependency[];
    warnings: string[];
}
export interface GeneratedPluginScenario {
    kind: 'load' | PluginComponentKind;
    component?: string;
    path: string;
}
export interface PluginInitResult {
    pluginName: string;
    outputDir: string;
    discoveryPath: string;
    scenarios: GeneratedPluginScenario[];
    discovery: PluginDiscovery;
}
export interface PluginInitOptions {
    cwd?: string;
    output?: string;
    force?: boolean;
}
export declare function discoverPlugin(pluginPath: string): Promise<PluginDiscovery>;
export declare function generatePluginScenarios(pluginPath: string, options?: PluginInitOptions): Promise<PluginInitResult>;
//# sourceMappingURL=plugin-init.d.ts.map