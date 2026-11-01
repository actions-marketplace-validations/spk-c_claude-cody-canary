export declare const CanaryExitCode: {
    readonly success: 0;
    readonly regression: 2;
    readonly infrastructure: 3;
    readonly configuration: 4;
};
export type CanaryExitCodeValue = (typeof CanaryExitCode)[keyof typeof CanaryExitCode];
export declare function exitCodeForSuite(result: {
    passed: boolean;
    infrastructureFailedCount: number;
}): CanaryExitCodeValue;
export declare function exitCodeForWatch(status: string, infrastructureFailedCount?: number): CanaryExitCodeValue;
//# sourceMappingURL=exit-codes.d.ts.map