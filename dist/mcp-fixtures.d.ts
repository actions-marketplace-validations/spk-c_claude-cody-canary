export type SafeMcpFixtureKind = 'read' | 'write' | 'timeout' | 'malformed-schema' | 'dynamic-tools' | 'disconnect' | 'pagination' | 'annotations';
export interface SafeMcpFixture {
    kind: SafeMcpFixtureKind;
    root: string;
    stateDir: string;
    scriptPath: string;
    command: string;
    args: string[];
    cleanup: () => Promise<void>;
}
export declare function createSafeMcpFixture(kind: SafeMcpFixtureKind, options?: {
    root?: string;
}): Promise<SafeMcpFixture>;
//# sourceMappingURL=mcp-fixtures.d.ts.map