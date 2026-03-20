/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve("@cf/eslint-config/base")],
  // This tells ESLint to load the config from the package `@cf/eslint-config`
  // which is located in the tooling/eslint-config directory
  parserOptions: {
    project: "./tsconfig.json",
  },
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    ".next/",
    ".turbo/",
    "coverage/",
    "playwright-report/",
    "test-results/",
    "*.config.js",
    "*.config.ts",
    ".eslintrc.js",
    "scripts/",
    "e2e/",
  ],
};
