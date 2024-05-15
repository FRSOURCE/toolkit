const { name } = require('./package.json');
const { monorepoIndependent } = require('@frsource/release-it-config');

module.exports = monorepoIndependent({ pkgName: name });
