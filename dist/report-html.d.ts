export interface ResultArtifactSummary {
    file: string;
    kind: 'suite' | 'run' | 'watch' | 'flake' | 'other';
    title: string;
    passed?: boolean;
    status?: string;
    createdAt?: string;
    totalTokens?: number;
    toolCalls?: number;
    durationMs?: number;
    failures: string[];
    fingerprint?: string;
    scenarioTotal?: number;
    scenarioPassed?: number;
    scenarioFailed?: number;
    scenarioSkipped?: number;
}
export declare function loadResultSummaries(directory: string): Promise<ResultArtifactSummary[]>;
export declare function renderStaticHtmlReport(summaries: ResultArtifactSummary[], title?: string): string;
export declare function generateStaticHtmlReport(inputDirectory: string, outputDirectory: string, title?: string): Promise<string>;
//# sourceMappingURL=report-html.d.ts.map