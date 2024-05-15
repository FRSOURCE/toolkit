# @frsource/eslint-config

ESLint configuration files used across the FRSOURCE organization.

> Note: this package aims to provide shared configuration for specific languages/frameworks - it does not necesarily setup globals that are specific to your enviroment. [Always remember to add those using ESLint documentation](https://eslint.org/docs/latest/use/configure/language-options#using-configuration-files).

## Usage

```js
// eslint.config.mjs

export { typescript as default } from '@frsource/eslint-config';
```
