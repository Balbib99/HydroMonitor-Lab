import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commandShell = process.env.ComSpec ?? 'cmd.exe';
const frontendUrl = 'http://localhost:5173';
const startupTimeoutMs = 30_000;
const children = [];

function spawnNpm(args) {
  const child = process.platform === 'win32'
    ? spawn(commandShell, ['/d', '/s', '/c', ['npm', ...args].join(' ')], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: false,
      })
    : spawn(npmCommand, args, {
        cwd: rootDir,
        stdio: 'inherit',
        shell: false,
      });

  children.push(child);

  return child;
}

function runNpm(args) {
  return new Promise((resolve) => {
    const child = spawnNpm(args);

    child.on('exit', (code) => {
      resolve(code ?? 1);
    });
  });
}

async function waitForUrl(url) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < startupTimeoutMs) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // The dev server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function stopChild(child) {
  if (child.exitCode !== null || child.killed) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    child.once('exit', () => resolve());

    if (process.platform === 'win32') {
      const taskkill = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        shell: false,
      });

      taskkill.on('exit', () => resolve());
      taskkill.on('error', () => resolve());
      return;
    }

    child.kill('SIGTERM');
    setTimeout(() => {
      if (child.exitCode === null && !child.killed) {
        child.kill('SIGKILL');
      }
    }, 2_000);
  });
}

try {
  spawnNpm(['run', 'dev']);
  spawnNpm(['run', 'mock-server']);
  await waitForUrl(frontendUrl);

  const cypressExitCode = await runNpm(['run', 'cypress:run']);
  process.exitCode = cypressExitCode;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await Promise.all(children.map((child) => stopChild(child)));
}
