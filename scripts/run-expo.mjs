import { accessSync, mkdirSync, constants as fsConstants } from 'node:fs';
import { spawn } from 'node:child_process';

const expoArgs = process.argv.slice(2);

function shouldUseActiveArchOnly(args) {
  if (args[0] !== 'run:android') {
    return false;
  }

  if (process.env.EXPO_NO_ACTIVE_ARCH_ONLY === '1') {
    return false;
  }

  return !args.includes('--active-arch-only');
}

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

const normalizedExpoArgs = shouldUseActiveArchOnly(expoArgs)
  ? [...expoArgs, '--active-arch-only']
  : expoArgs;

if (normalizedExpoArgs !== expoArgs) {
  console.log(
    'Using --active-arch-only for local Android builds. Set EXPO_NO_ACTIVE_ARCH_ONLY=1 to disable.',
  );
}

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['expo', ...normalizedExpoArgs],
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
