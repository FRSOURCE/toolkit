import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
import { overrides as javascriptOverrides } from './javascript.mjs';

/** @type { import("eslint").Linter.Config[] } */
export const overrides = [
  {
    files: ['.*.{ts,mts,tsx}', '*.config.{ts,mts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  ...javascriptOverrides,
];

/** @type {ReturnType<import('typescript-eslint')['config']>} */
const rules = ts.config(
  js.configs.recommended,
  ...ts.configs.strict,
  prettier,
  ...overrides,
);
export default rules;
