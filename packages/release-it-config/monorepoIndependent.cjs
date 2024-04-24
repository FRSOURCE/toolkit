/**
 * Configuration for independent package in monorepo workspace
 * @param {Object} options
 * @param {string} options.pkgName name of the package in the monorepo, e.g. `@frsource/my-package`
 * @param {string} [options.buildCmd="pnpm build"] command that should be used to build the package, defaults to `pnpm build`
 * @param {string} [options.pluginsPath=""] (for internal usage only)
 */
module.exports = ({
  pkgName,
  buildCmd = 'pnpm build',
  pluginsPath = '@frsource/release-it-config',
}) => {
  return {
    npm: {
      publishPath: '*.tgz',
      publish: true,
    },
    git: {
      requireBranch: 'main',
      requireCommits: false,
      requireCommitsFail: false, // if there are no new commits release-it will stop the release process, but without throwing and error
      requireCleanWorkingDir: true,
      commitsPath: '.',
      commitMessage: 'chore(release): ${npm.name} v${version}',
      tagName: '${npm.name}-v${version}',
      tagMatch: '${npm.name}-v[0-9]*.[0-9]*.[0-9]*',
      getLatestTagFromAllRefs: false, // https://github.com/release-it/release-it/blob/main/docs/git.md#use-all-refs-to-determine-latest-tag
    },
    github: {
      release: true,
      releaseName: `${pkgName}@\${version}`,
      comments: {
        submit: false, // hitting the secondary rate limit issues, see:
        // https://github.com/FRSOURCE/toolkit/actions/runs/8730568392/job/23954615077#step:8:38
        issue:
          ':rocket: _This issue has been resolved in [${releaseName} (click for release notes)](${releaseUrl})._',
        pr: ':rocket: _This pull request is included in [${releaseName} (click for release notes)](${releaseUrl})._',
      },
    },
    plugins: {
      '@release-it/conventional-changelog': {
        gitRawCommitsOpts: {
          path: '.',
        },
        preset: 'angular',
        infile: 'CHANGELOG.md',
      },
      [`${pluginsPath}/cross-deps-version-plugin.mjs`]: {},
    },
    hooks: {
      'after:init': buildCmd,
      'before:npm:release': 'pnpm pack',
      'after:npm:release': 'rm *.tgz',
    },
  };
};
