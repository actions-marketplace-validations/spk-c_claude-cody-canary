export type PluginSurfaceSource = 'default' | 'manifest';
export interface PluginLspServer {
    kind: 'lsp';
    name: string;
    path: string;
    source: PluginSurfaceSource;
    command: string;
    extensions: string[];
}
export interface PluginMonitor {
    name: string;
    path: string;
    source: PluginSurfaceSource;
    command: string;
    description: string;
    when?: string;
}
export interface PluginDependency {
    name: string;
    version?: string;
    marketplace?: string;
}
export interface PluginExtendedSurfaces {
    lspServers: PluginLspServer[];
    monitors: PluginMonitor[];
    dependencies: PluginDependency[];
    warnings: string[];
}
export declare function discoverExtendedPluginSurfaces(root: string, manifest: Record<string, unknown>): Promise<PluginExtendedSurfaces>;
//# sourceMappingURL=plugin-surfaces.d.ts.map