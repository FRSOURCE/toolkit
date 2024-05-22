import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import globals from 'globals';
import { env } from 'node:process';

/** @type { import("eslint").Linter.FlatConfig[] } */
export const overrides = [
  {
    rules: {
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
      'no-console': 'error',
      'no-debugger': env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
  {
    files: ['.*.{js,cjs,mjs,jsx}', '*.config.{js,cjs,mjs,jsx}'],
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

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [js.configs.recommended, prettier, ...overrides];
