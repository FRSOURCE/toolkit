import { typescript } from '@frsource/eslint-config';
import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['scripts/**'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
