import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
import { env } from 'node:process';

/** @type { import("eslint").Linter.FlatConfig[] } */
export const overrides = [
  {
    rules: {
      '@typescript-eslint/semi': 2,
      semi: 0,
      curly: 0,
      indent: ['off', 2, { offsetTernaryExpressions: true }],
      'comma-dangle': 'off',
      'arrow-parens': [
        'off',
        'as-needed',
        {
          requireForBlockBody: true,
        },
      ],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'func-call-spacing': 0,
      'no-debugger': env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
  {
    files: [
      '.*.{js,cjs,mjs,ts,mts,tsx,jsx}',
      '*.config.{js,cjs,mjs,ts,mts,tsx,jsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];

/** @type {import('typescript-eslint')['config']} */
export default ts.config(
  js.configs.recommended,
  ...ts.configs.strict,
  prettier,
  ...overrides,
);
