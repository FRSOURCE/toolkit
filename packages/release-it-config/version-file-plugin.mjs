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
  init() {
    try {
      fs.accessSync(this.getContext('versionFile'));
    } catch {
      throw e('Skipping release: VERSION file not present.', false);
    }

    const data = fs.readFileSync(this.getContext('versionFile'));
    const latestVersion = data.toString().trim();
    this.setContext({ latestVersion });
  }
  getLatestVersion() {
    return this.getContext('latestVersion');
  }
  bump(version) {
    this.setContext({ version });
    fs.unlinkSync(this.getContext('versionFile'));
  }
}

export default VersionFilePlugin;
