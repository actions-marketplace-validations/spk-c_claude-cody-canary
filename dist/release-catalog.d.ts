export declare function compareExactVersions(a: string, b: string): number;
export declare function publishedVersionsBetween(publishedVersions: Iterable<string>, good: string, bad: string): string[];
export declare function fetchPublishedClaudeVersions(): Promise<string[]>;
export declare function fetchPublishedVersionsBetween(good: string, bad: string): Promise<string[]>;
//# sourceMappingURL=release-catalog.d.ts.map