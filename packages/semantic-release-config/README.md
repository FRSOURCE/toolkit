# @frsource/semantic-release-config

Semantic Release configuration files used across the FRSOURCE organization.

## Usage

```js
// .releaserc.mjs

export { default } from '@frsource/semantic-release-config';
```

## Skipping releases that change nothing

`chore(deps)` commits trigger a patch release. To avoid publishing a new version for dependency bumps that do not change what consumers receive (for example `devDependencies` updates), the commit analyzer is wrapped: when `chore(deps)` commits are the only reason to release, the package is packed with `npm pack` and compared to the tarball of the last published version. If the content is identical, the release is skipped.

- Compared byte for byte, except `package.json`, where `version` and `devDependencies` (and registry-injected fields) are ignored. A change to anything else in `package.json`, such as `dependencies`, still releases.
- Any `fix`, `feat` or breaking commit always releases, without packing.
- If the comparison cannot be made (first release, version not on the registry, offline), the release goes ahead.
- Build the package before running semantic-release, so the packed output reflects the release.
