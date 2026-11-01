import { spawn } from 'node:child_process';
const DEFAULT_MAX_OUTPUT_CHARS = 16 * 1024 * 1024;
/**
 * On POSIX, every child starts in its own process group, allowing a timeout to
 * terminate shell/grandchild processes as well as Claude itself.
 * Windows needs taskkill /T, because killing a parent PID leaves children alive.
 */
function killProcessTree(child) {
    if (!child.pid) {
        child.kill('SIGKILL');
        return;
    }
    if (process.platform === 'win32') {
        try {
            const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
                stdio: 'ignore', windowsHide: true,
            });
            killer.once('error', () => { try {
                child.kill('SIGKILL');
            }
            catch { /* exited */ } });
        }
        catch {
            try {
                child.kill('SIGKILL');
            }
            catch { /* exited */ }
        }
        return;
    }
    try {
        process.kill(-child.pid, 'SIGKILL');
    }
    catch {
        try {
            child.kill('SIGKILL');
        }
        catch { /* already exited */ }
    }
}
export async function spawnCapture(executable, args, options) {
    const started = Date.now();
    const maxOutputChars = options.maxOutputChars ?? DEFAULT_MAX_OUTPUT_CHARS;
    if (!Number.isInteger(maxOutputChars) || maxOutputChars < 1) {
        throw new Error('maxOutputChars must be a positive integer.');
    }
    return await new Promise((resolve) => {
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        let outputTruncated = false;
        let settled = false;
        let timer;
        const finish = (result) => {
            if (settled)
                return;
            settled = true;
            if (timer)
                clearTimeout(timer);
            resolve({ ...result, durationMs: Date.now() - started });
        };
        let child;
        try {
            child = spawn(executable, args, {
                cwd: options.cwd,
                env: options.env ?? process.env,
                shell: false,
                windowsHide: true,
                detached: process.platform !== 'win32',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        }
        catch (error) {
            finish({
                code: 127,
                signal: null,
                stdout,
                stderr: error instanceof Error ? error.message : String(error),
                timedOut: false,
                outputTruncated: false,
            });
            return;
        }
        const appendBounded = (target, chunk) => {
            if (outputTruncated)
                return;
            const text = chunk.toString();
            const used = stdout.length + stderr.length;
            const remaining = maxOutputChars - used;
            if (remaining <= 0) {
                outputTruncated = true;
                killProcessTree(child);
                return;
            }
            const accepted = text.slice(0, remaining);
            if (target === 'stdout')
                stdout += accepted;
            else
                stderr += accepted;
            if (accepted.length < text.length) {
                outputTruncated = true;
                killProcessTree(child);
            }
        };
        child.stdout?.setEncoding('utf8');
        child.stderr?.setEncoding('utf8');
        child.stdout?.on('data', (chunk) => appendBounded('stdout', chunk));
        child.stderr?.on('data', (chunk) => appendBounded('stderr', chunk));
        child.on('error', (error) => {
            finish({
                code: 127,
                signal: null,
                stdout,
                stderr: `${stderr}${error.message}`,
                timedOut,
                outputTruncated,
            });
        });
        child.on('close', (code, signal) => {
            finish({ code: code ?? 1, signal, stdout, stderr, timedOut, outputTruncated });
        });
        if (options.timeoutMs && options.timeoutMs > 0) {
            timer = setTimeout(() => {
                timedOut = true;
                killProcessTree(child);
            }, options.timeoutMs);
            timer.unref();
        }
    });
}
export async function runShellCommand(command, cwd, timeoutMs = 10 * 60 * 1000) {
    if (process.platform === 'win32') {
        return spawnCapture(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', command], { cwd, timeoutMs });
    }
    return spawnCapture('/bin/sh', ['-lc', command], { cwd, timeoutMs });
}
//# sourceMappingURL=process.js.map