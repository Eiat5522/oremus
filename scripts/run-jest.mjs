import { accessSync, constants as fsConstants, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const jestArgs = process.argv.slice(2);

function pointsToMountedWindowsPath(value) {
  return typeof value === 'string' && value.startsWith('/mnt/') && value.length > 5;
}

function resolveWritableTempDir(env) {
  const candidate = env.CODEX_WRITABLE_TMPDIR || '/tmp/oremus-expo';
  mkdirSync(candidate, { recursive: true });
  return candidate;
}

function canWriteToPath(targetPath) {
  if (!targetPath) {
    return false;
  }

  try {
    accessSync(targetPath, fsConstants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
  return path;
}

function buildEnv() {
  const env = { ...process.env };
  const hasUnsafeTemp =
    pointsToMountedWindowsPath(env.TMPDIR) ||
    pointsToMountedWindowsPath(env.TMP) ||
    pointsToMountedWindowsPath(env.TEMP);
  const hasWritableHome = canWriteToPath(env.HOME);

  if (!hasUnsafeTemp && hasWritableHome) {
    return env;
  }

  const writableTempDir = resolveWritableTempDir(env);

  if (hasUnsafeTemp) {
    env.TMPDIR = writableTempDir;
    env.TMP = writableTempDir;
    env.TEMP = writableTempDir;
  }

  if (!hasWritableHome) {
    const toolHome = ensureDir(`${writableTempDir}/tooling-home`);
    env.GRADLE_USER_HOME = env.GRADLE_USER_HOME || ensureDir(`${toolHome}/gradle`);
    env.XDG_DATA_HOME = env.XDG_DATA_HOME || ensureDir(`${toolHome}/xdg-data`);
    env.XDG_CACHE_HOME = env.XDG_CACHE_HOME || ensureDir(`${toolHome}/xdg-cache`);
    env.ANDROID_USER_HOME = env.ANDROID_USER_HOME || ensureDir(`${toolHome}/android`);
    env.ANDROID_PREFS_ROOT = env.ANDROID_PREFS_ROOT || env.ANDROID_USER_HOME;
  }

  return env;
}

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['jest', '--runInBand', ...jestArgs],
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
