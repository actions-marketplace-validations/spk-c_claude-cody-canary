import type { ProcessResult } from './types.js';
interface SpawnOptions {
    cwd: string;
    timeoutMs?: number;
    env?: NodeJS.ProcessEnv;
    maxOutputChars?: number;
}
export declare function spawnCapture(executable: string, args: string[], options: SpawnOptions): Promise<ProcessResult>;
export declare function runShellCommand(command: string, cwd: string, timeoutMs?: number): Promise<ProcessResult>;
export {};
//# sourceMappingURL=process.d.ts.map