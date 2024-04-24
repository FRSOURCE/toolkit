const { name } = require('./package.json');
const { monorepoIndependent } = require('./index.cjs');

module.exports = monorepoIndependent({
  pkgName: name,
  pluginsPath: '.',
});
