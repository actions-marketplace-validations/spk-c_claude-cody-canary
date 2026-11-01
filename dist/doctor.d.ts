import type { DoctorCheck } from './types.js';
export type DoctorProviderMode = 'first-party' | 'custom-base-url' | 'bedrock' | 'vertex' | 'foundry' | 'mantle' | 'ambiguous';
export type DoctorMcpTransport = 'stdio' | 'http' | 'sse' | 'unknown';
export type DoctorBinaryKind = 'lsp' | 'mcp';
export interface DoctorWarning {
    code: string;
    message: string;
}
export interface DoctorProviderReport {
    mode: DoctorProviderMode;
    indicators: string[];
    credentialsPresent: {
        anthropicApiKey: boolean;
        claudeOauthToken: boolean;
        awsRegion: boolean;
        awsCredentials: boolean;
        vertexProject: boolean;
        googleCredentials: boolean;
        foundryResource: boolean;
    };
}
export interface DoctorBinaryRequirement {
    kind: DoctorBinaryKind;
    owner: string;
    name: string;
    executable: string;
    available: boolean;
}
export interface DoctorPluginReport {
    path: string;
    ok: boolean;
    name?: string;
    componentTypes: string[];
    counts: {
        commands: number;
        agents: number;
        skills: number;
        hooks: number;
        mcpServers: number;
        lspServers: number;
        monitors: number;
        dependencies: number;
    };
    dependencies: Array<{
        name: string;
        version?: string;
        marketplace?: string;
    }>;
    warnings: string[];
    error?: string;
}
export interface DoctorMcpServerReport {
    name: string;
    transport: DoctorMcpTransport;
    executable?: string;
    executableAvailable?: boolean;
}
export interface DoctorMcpReport {
    projectConfig: boolean;
    servers: DoctorMcpServerReport[];
    transports: Record<DoctorMcpTransport, number>;
    warnings: string[];
}
export interface DoctorReport {
    schemaVersion: 1;
    ok: boolean;
    canaryVersion: string;
    runtime: {
        nodeVersion: string;
        platform: NodeJS.Platform;
        arch: string;
        tty: boolean;
        ci: boolean;
    };
    claude: {
        requestedExecutable: string;
        executableSource: 'PATH' | 'explicit-path' | 'unresolved';
        available: boolean;
        version?: string;
    };
    repository: {
        available: boolean;
        clean?: boolean;
        trackedChanges?: number;
    };
    provider: DoctorProviderReport;
    features: {
        agentTeams: boolean;
    };
    plugins: DoctorPluginReport[];
    mcp: DoctorMcpReport;
    requiredBinaries: DoctorBinaryRequirement[];
    checks: DoctorCheck[];
    warnings: DoctorWarning[];
}
export interface DoctorOptions {
    claudeExecutable?: string;
    plugins?: string[];
    env?: NodeJS.ProcessEnv;
    isTTY?: boolean;
    autoDiscoverPlugin?: boolean;
    inspectMcp?: boolean;
}
export declare function detectProviderConfiguration(env?: NodeJS.ProcessEnv): DoctorProviderReport;
export declare function findExecutable(command: string, cwd: string, env?: NodeJS.ProcessEnv): Promise<string | null>;
export declare function runDoctorReport(cwd: string, options?: DoctorOptions): Promise<DoctorReport>;
export declare function runDoctor(cwd: string, claudeExecutable?: string): Promise<DoctorCheck[]>;
export declare function formatDoctor(input: DoctorCheck[] | DoctorReport): string;
//# sourceMappingURL=doctor.d.ts.map