import { Plugin } from 'release-it';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, EOL } from 'node:os';

const VERSION_BUMP_INFO_PATH = join(tmpdir(), 'FRSOURCE_VERSION_BUMP');
const docs = 'https://git.io/release-it-git';

const toUnique = (array) => [...new Set(array)];
const flattenDependencies = (infoObj, result = []) => {
  if (infoObj?.dependencies) {
    for (const [key, internalInfoObj] of Object.entries(infoObj.dependencies)) {
      result.push(key);
      flattenDependencies(internalInfoObj, result);
    }
  }
  return result;
};
const e = (message, docs, fail = true) => {
  const error = new Error(
    docs ? `${message}${EOL}Documentation: ${docs}${EOL}` : message,
  );
  error.code = fail ? 1 : 0;
  return error;
};

export default class CrossDepsVersionPlugin extends Plugin {
  async getLatestVersion() {
    this.log.log('Reading version file from:', VERSION_BUMP_INFO_PATH);
    const gitOptions = this.config.getContext()?.git ?? {};

    const shouldBeIncremented = await this.shouldBeIncremented();
    const commitsSinceLatestTag = await this.getCommitsSinceLatestTag(
      gitOptions.commitsPath,
    );

    // check commit requirement only when package doesn't need to be bumped because of workspace cross-dependencies
    if (!shouldBeIncremented && commitsSinceLatestTag === 0) {
      throw e(
        `There are no commits since the latest tag.`,
        docs,
        gitOptions.requireCommitsFail,
      );
    }
  }

  afterRelease() {
    writeFileSync(
      VERSION_BUMP_INFO_PATH,
      `${this.config.getContext('name')}\n`,
      { flag: 'as' },
    );
  }

  async shouldBeIncremented() {
    const recentlyBumpedPackages = this.getRecentlyBumpedPackages();
    const workspaceDependencies = await this.getWorkspaceDependencies();

    this.debug({ recentlyBumpedPackages, workspaceDependencies });

    return workspaceDependencies.some((depName) =>
      recentlyBumpedPackages.includes(depName),
    );
  }

  async getWorkspaceDependencies() {
    const packageInfoRaw = await this.exec(
      'pnpm list --only-projects --depth Infinity --json -P',
      { options: { write: false } },
    );
    const packageInfo = toUnique(JSON.parse(packageInfoRaw));
    return flattenDependencies(packageInfo?.[0]);
  }

  getRecentlyBumpedPackages() {
    if (!existsSync(VERSION_BUMP_INFO_PATH)) return [];
    return toUnique(
      readFileSync(VERSION_BUMP_INFO_PATH, 'utf-8')
        .split('\n')
        .slice(1)
        .filter(Boolean),
    );
  }

  async getCommitsSinceLatestTag(commitsPath = '') {
    const { latestTag } = this.config.getContext();
    const ref = latestTag ? `${latestTag}..HEAD` : 'HEAD';
    return this.exec(`git rev-list ${ref} --count ${commitsPath}`, {
      options: { write: false },
    }).then(Number);
  }
}
