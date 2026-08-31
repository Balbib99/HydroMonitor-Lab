import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const command = process.argv[2] ?? 'run';
const extraArgs = process.argv.slice(3);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cypressBin = path.join(rootDir, 'node_modules', 'cypress', 'bin', 'cypress');
const env = { ...process.env };

delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(process.execPath, [cypressBin, command, ...extraArgs], {
  cwd: rootDir,
  env,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
