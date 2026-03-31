import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const expoArgs = process.argv.slice(2);

function pointsToMountedWindowsPath(value) {
  return typeof value === 'string' && value.startsWith('/mnt/') && value.length > 5;
}

function resolveWritableTempDir(env) {
  const candidate = env.CODEX_WRITABLE_TMPDIR || '/tmp/oremus-expo';
  try {
    mkdirSync(candidate, { recursive: true });
  } catch (err) {
    console.error(`Failed to create writable temp directory at ${candidate}:`, err.message);
    throw err;
  }
  return candidate;
}

function buildEnv() {
  const env = { ...process.env };
  const hasUnsafeTemp =
    pointsToMountedWindowsPath(env.TMPDIR) ||
    pointsToMountedWindowsPath(env.TMP) ||
    pointsToMountedWindowsPath(env.TEMP);

  if (!hasUnsafeTemp) {
    return env;
  }

  const writableTempDir = resolveWritableTempDir(env);
  env.TMPDIR = writableTempDir;
  env.TMP = writableTempDir;
  env.TEMP = writableTempDir;

  return env;
}

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['expo', ...expoArgs],
  {
    env: buildEnv(),
    stdio: 'inherit',
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
