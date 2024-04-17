/**
 * Configuration for independent package in monorepo workspace
 * @param {Object} options
 * @param {string} options.name name of the package in the monorepo, e.g. `my-package`
 * @param {string} [options.path=`packages/${options.name}`] path of the package in the monorepo, will default to `packages/${options.name}`
 * @param {string} [options.buildCmd="pnpm build"] command that should be used to build the package, defaults to `pnpm build`
 */
module.exports = ({
  name,
  path = `packages/${name}`,
  buildCmd = "pnpm build",
}) => ({
  git: {
    requireCommits: true,
    // requireCleanWorkingDir: false,
    // addUntrackedFiles: true,
    commitMessage: "chore(repo): release ${npm.name} ${version}",
    tagName: "${npm.name}-v${version}",
  },
  plugins: {
    "@release-it/conventional-changelog": {
      gitRawCommitsOpts: {
        path,
      },
    },
    "@release-it/bumper": {
      in: "version.json",
      out: ["version.json", "dist/**/package.json"],
    },
  },
  hooks: {
    "before:bump": buildCmd,
    "after:bump": [
      "git checkout -- package.json", // check out package.json
      "git checkout -- pnpm-lock.yaml", // check out package-lock.json
    ],
  },
});
