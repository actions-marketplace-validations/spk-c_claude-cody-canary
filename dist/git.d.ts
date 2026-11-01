export declare function getRepoRoot(cwd: string): Promise<string>;
export declare function getGitDir(cwd: string): Promise<string>;
export declare function getHeadCommit(cwd: string): Promise<string>;
export declare function resolveCommit(cwd: string, ref: string): Promise<string>;
export declare function getTrackedChanges(cwd: string): Promise<string[]>;
export interface WorktreeHandle {
    path: string;
    cleanup: () => Promise<void>;
}
export declare function createDetachedWorktree(repoRoot: string, ref?: string): Promise<WorktreeHandle>;
export declare function getChangedFiles(cwd: string): Promise<string[]>;
//# sourceMappingURL=git.d.ts.map