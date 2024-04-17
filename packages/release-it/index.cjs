/**
 * @param {Object} options
 * @param {string} options.path path of the package in the monorepo, e.g. "packages/my-package"
 * @param {string} [options.buildCmd="pnpm build"] command that should be used to build the package, defaults to "pnpm build"
 */
module.exports = ({ path, buildCmd }) => ({
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
