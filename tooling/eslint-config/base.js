/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
  ],
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: [
    "@typescript-eslint",
    "import",
    "unused-imports",
    "simple-import-sort",
  ],
  rules: {
    // Note: turbo plugin is not included in base config due to workspace detection issues
    // Apps should extend from eslint-config-turbo directly if needed
    "import/consistent-type-specifier-style": "off",

    // Disable default TypeScript unused vars rule in favor of unused-imports plugin
    "@typescript-eslint/no-unused-vars": "off",

    // Unused imports plugin for auto-fixing
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],

    // Import sorting
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    // Type imports
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],

    // Promises
    "@typescript-eslint/no-misused-promises": [
      2,
      { checksVoidReturn: { attributes: false } },
    ],

    // Code quality
    "max-params": ["error", 4],
    "max-lines-per-function": ["error", 300],

    // Import cycles
    "import/no-cycle": ["error", { maxDepth: 5 }],
  },
  ignorePatterns: [
    "**/.eslintrc.cjs",
    "**/*.config.js",
    "**/*.config.cjs",
    ".next",
    "dist",
    "pnpm-lock.yaml",
    "bun.lockb",
  ],
  reportUnusedDisableDirectives: true,
};

module.exports = config;
