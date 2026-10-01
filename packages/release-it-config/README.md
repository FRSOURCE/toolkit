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

The config assumes the package is published with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) from GitHub Actions: release-it's `npm whoami` / collaborator pre-checks are skipped (`npm.skipChecks`), so the release job only needs the `id-token: write` permission and no `NPM_TOKEN`.
