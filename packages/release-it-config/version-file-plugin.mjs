import { Plugin } from 'release-it';
import fs from 'node:fs';
import path from 'node:path';
import { EOL } from 'node:os';

// based on https://github.com/release-it/release-it/blob/679bd0e2480d2e04aea4f8d5ecc00183dbd60c05/docs/recipes/my-version.md

const e = (message, docs, fail = true) => {
  const error = new Error(
    docs ? `${message}${EOL}Documentation: ${docs}${EOL}` : message,
  );
  error.code = fail ? 1 : 0;
  return error;
};

class VersionFilePlugin extends Plugin {
  constructor(...args) {
    super(...args);
    this.setContext({ versionFile: path.resolve('./VERSION') });
  }

  getVersion() {
    let isFilePresent = true;
    try {
      fs.accessSync(this.getContext('versionFile'));
    } catch {
      isFilePresent = false;
    }

    if (isFilePresent) {
      const data = fs.readFileSync(this.getContext('versionFile'));
      return data.toString().trim();
    }
  }

  getIncrement({ latestVersion }) {
    const newVersion = this.getVersion();
    if (!newVersion && this.options.skipReleaseIfNotPresent) {
      throw e('Skipping release: VERSION file not present.', '', false);
    }
    if (latestVersion === newVersion) {
      throw e(
        'Skipping release: version from VERSION file was already released.',
        '',
        false,
      );
    }

    if (newVersion) {
      this.config.setContext({ version: { increment: newVersion } });
    }

    return newVersion || null;
  }
  getChangelog(latestVersion) {
    this.getIncrement({ latestVersion });
  }
  getIncrementedVersion(...args) {
    return this.getIncrement(...args);
  }
  getIncrementedVersionCI(...args) {
    return this.getIncrement(...args);
  }
  bump(version) {
    this.setContext({ version });
    fs.unlinkSync(this.getContext('versionFile'));
  }
}

export default VersionFilePlugin;
