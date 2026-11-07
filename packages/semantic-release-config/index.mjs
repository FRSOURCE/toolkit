import { analyzeCommits } from './skip-unchanged.mjs';

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
  plugins: [
    [
      { analyzeCommits },
      {
        releaseRules: [{ type: 'chore', scope: 'deps', release: 'patch' }],
      },
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/github',
    [
      '@semantic-release/npm',
      {
        tarballDir: 'release',
      },
    ],
    '@semantic-release/git',
  ],
  preset: 'angular',
};
