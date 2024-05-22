import { javascript } from '@frsource/eslint-config';
import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  ...javascript,
  {
    files: ['**.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
