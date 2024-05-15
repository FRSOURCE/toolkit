# @frsource/release-it-config

Release-it configuration files used across the FRSOURCE organization.

## Usage

### In monorepo package

```js
// release-it.cjs

const { name } = require('./package.json');
const { monorepoIndependent } = require('@frsource/release-it-config');

module.exports = monorepoIndependent({ pkgName: name });
```
