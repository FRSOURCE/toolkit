const { name } = require('./package.json');
const { monorepoIndependent } = require('@frsource/release-it-config');

const config = monorepoIndependent({ pkgName: name });

delete config.plugins[
  '@frsource/release-it-config/cross-deps-version-plugin.mjs'
];

module.exports = {
  ...config,
  plugins: {
    '@frsource/release-it-config/version-file-plugin.mjs': {
      skipReleaseIfNotPresent: true,
    },
    ...config.plugins,
  },
};
