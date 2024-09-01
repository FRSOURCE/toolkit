import { javascript } from '@frsource/eslint-config';
import globals from 'globals';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...javascript,
  {
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['**.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
