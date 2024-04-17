const nodePath = require("path");

/**
 * Configuration for independent package in monorepo workspace
 * @param {Object} options
 * @param {string} options.pkgName name of the package in the monorepo, e.g. `@frsource/my-package`
 * @param {string} [options.path=`packages/${options.pkgName}`] path of the package relative to the monorepo root, without starting slash. Always use "/" as delimiter. Will default to `packages/${options.pkgName}` (package scope in `options.pkgName` will be omitted)
 * @param {string} [options.buildCmd="pnpm build"] command that should be used to build the package, defaults to `pnpm build`
 */
module.exports = ({
  pkgName,
  path = `packages/${pkgName.substring(pkgName.lastIndexOf("/") + 1)}`,
  buildCmd = "pnpm build",
}) => {
  if (path.startsWith("/")) path = path.substring(1);
  const nestingLevel = path.split("/").length;
  if (nodePath.sep !== "/") path = path.replaceAll("/", nodePath.sep);

  return {
    npm: {
      publishPath: "package-pack.tgz",
      publish: false,
      versionArgs: ["--allow-same-version"],
    },
    git: {
      requireBranch: "main",
      requireCommits: true,
      requireCommitsFail: false, // if there are no new commits release-it will stop the release process, but without throwing and error
      requireCleanWorkingDir: true,
      commitsPath: ".",
      commitMessage: "chore(release): ${npm.name} v${version}",
      tagName: "${npm.name}-v${version}",
      tagMatch: "${npm.name}-v[0-9]*.[0-9]*.[0-9]*",
      getLatestTagFromAllRefs: false, // https://github.com/release-it/release-it/blob/main/docs/git.md#use-all-refs-to-determine-latest-tag
    },
    github: {
      release: true,
      releaseName: `${pkgName}@\${version}`,
      comments: {
        submit: false, // hitting the secondary rate limit issues, see:
        // https://github.com/FRSOURCE/toolkit/actions/runs/8730568392/job/23954615077#step:8:38
        issue:
          ":rocket: _This issue has been resolved in [${releaseName} (click for release notes)](${releaseUrl})._",
        pr: ":rocket: _This pull request is included in [${releaseName} (click for release notes)](${releaseUrl})._",
      },
    },
    plugins: {
      "@release-it/conventional-changelog": {
        gitRawCommitsOpts: {
          path,
        },
        preset: "angular",
        infile: "CHANGELOG.md",
      },
    },
    hooks: {
      "before:bump": buildCmd,
      "after:bump": [
        "pnpm install",
        `git add ${"../".repeat(nestingLevel)}pnpm-lock.yaml`,
      ],
      // "before:npm:release": "mv $(pnpm pack) package-pack.tgz",
      // "after:npm:release": "rm package-pack.tgz",
    },
  };
};
