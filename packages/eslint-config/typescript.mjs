export default [
  {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parserOptions: {
      parser: "@typescript-eslint/parser",
      ecmaVersion: "latest",
      sourceType: "module",
    },
    extends: ["prettier"],
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
      "prettier/prettier": [
        "error",
        {
          tabWidth: 2,
        },
      ],
      "@typescript-eslint/semi": 2,
      semi: 0,
      curly: 0,
      indent: ["off", 2, { offsetTernaryExpressions: true }],
      "comma-dangle": "off",
      "arrow-parens": [
        "off",
        "as-needed",
        {
          requireForBlockBody: true,
        },
      ],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "func-call-spacing": 0,
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    },
  },
];
