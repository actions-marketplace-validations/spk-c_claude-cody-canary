import type { Scenario } from './config.js';
export interface RecordingState {
    schemaVersion: 1;
    name: string;
    prompt: string;
    promptRedacted: boolean;
    startCommit: string;
    createdAt: string;
    setupCommands: string[];
    verifyCommands: string[];
    claude: {
        executable: string;
        version?: string;
        model?: string;
    };
    configFiles: string[];
}
export interface StartRecordingOptions {
    cwd?: string;
    prompt: string;
    setupCommands?: string[];
    verifyCommands?: string[];
    executable?: string;
    model?: string;
    force?: boolean;
}
export interface FinishRecordingOptions {
    cwd?: string;
    output?: string;
    setupCommands?: string[];
    verifyCommands?: string[];
}
export interface FinishRecordingResult {
    scenario: Scenario;
    scenarioPath: string;
    changedFiles: string[];
}
export declare function recordingSlug(name: string): string;
export declare function redactSensitiveText(value: string): string;
export declare function assertPortableCommands(commands: string[]): string[];
export declare function startRecording(name: string, options: StartRecordingOptions): Promise<RecordingState>;
export declare function buildRecordedScenario(state: RecordingState, changedFiles: string[], filesExist: string[], filesAbsent: string[], setupCommands: string[], verifyCommands: string[]): Scenario;
export declare function finishRecording(name: string, options?: FinishRecordingOptions): Promise<FinishRecordingResult>;
//# sourceMappingURL=record.d.ts.map