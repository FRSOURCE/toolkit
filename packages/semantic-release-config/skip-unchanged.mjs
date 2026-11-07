import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeCommits as analyze } from '@semantic-release/commit-analyzer';

/** package.json fields that never reach consumers in a meaningful way. */
const IGNORED_MANIFEST_FIELDS = ['version', 'devDependencies', 'gitHead'];

const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeys(value[key])]),
    );
  }
  return value;
};

const normalizeManifest = (raw) => {
  const manifest = JSON.parse(raw);
  for (const field of IGNORED_MANIFEST_FIELDS) delete manifest[field];
  for (const field of Object.keys(manifest)) {
    if (field.startsWith('_')) delete manifest[field];
  }
  return JSON.stringify(sortKeys(manifest));
};

const listFiles = (dir) =>
  readdirSync(dir, { recursive: true })
    .filter((entry) => statSync(join(dir, entry)).isFile())
    .map((entry) => entry.split('\\').join('/'))
    .sort();

const hash = (buffer) => createHash('sha256').update(buffer).digest('hex');

/**
 * Compares two extracted `npm pack` directories (the `package/` folders).
 * `package.json` is compared without `version`, `devDependencies` and
 * registry-injected fields; every other file byte by byte.
 *
 * @returns {boolean} true when consumers would receive identical content
 */
export const isSamePackedContent = (dirA, dirB) => {
  const filesA = listFiles(dirA);
  const filesB = listFiles(dirB);
  if (JSON.stringify(filesA) !== JSON.stringify(filesB)) return false;

  return filesA.every((file) => {
    const a = readFileSync(join(dirA, file));
    const b = readFileSync(join(dirB, file));
    if (file === 'package.json') {
      return normalizeManifest(a) === normalizeManifest(b);
    }
    return hash(a) === hash(b);
  });
};

const pack = (spec, cwd, destination) => {
  const [{ filename }] = JSON.parse(
    execFileSync(
      'npm',
      ['pack', spec, '--json', '--pack-destination', destination],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ),
  );
  const extracted = join(destination, `${hash(spec)}-extracted`);
  mkdirSync(extracted);
  execFileSync('tar', ['-xzf', join(destination, filename), '-C', extracted]);
  return join(extracted, 'package');
};

/**
 * Packs the current working tree and the last published version and compares
 * them. Throws when either of them cannot be packed.
 */
const isUnchangedSinceLastRelease = ({ cwd, lastRelease }) => {
  const { name } = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const tmp = mkdtempSync(join(tmpdir(), 'skip-unchanged-'));
  try {
    const current = pack('.', cwd, tmp);
    const published = pack(`${name}@${lastRelease.version}`, cwd, tmp);
    return isSamePackedContent(current, published);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
};

/**
 * Drop-in replacement for `@semantic-release/commit-analyzer`. When the only
 * thing triggering a release are the dependency-bump rules, the release is
 * skipped if the packed output is identical to the last published version.
 * Fails open: on any problem it behaves like the plain commit analyzer.
 */
export const analyzeCommits = async (pluginConfig, context) => {
  const releaseType = await analyze(pluginConfig, context);
  if (releaseType !== 'patch' || !context.lastRelease?.version) {
    return releaseType;
  }

  const withoutDepsRules = {
    ...pluginConfig,
    releaseRules: (pluginConfig.releaseRules ?? []).filter(
      ({ scope }) => scope !== 'deps',
    ),
  };
  if (await analyze(withoutDepsRules, context)) return releaseType;

  try {
    if (isUnchangedSinceLastRelease(context)) {
      context.logger.log(
        `Only dependency updates since ${context.lastRelease.version} and the packed output is unchanged, skipping release.`,
      );
      return null;
    }
  } catch (error) {
    context.logger.log(
      `Could not compare with ${context.lastRelease.version} (${error.message}), releasing.`,
    );
  }
  return releaseType;
};
