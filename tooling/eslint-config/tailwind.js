/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ["plugin:tailwindcss/recommended"],
  plugins: ["tailwindcss"],
  rules: {
    // Tailwind CSS class ordering
    "tailwindcss/classnames-order": [
      "warn",
      {
        officialSorting: true,
      },
    ],
    // Allow custom classes (for CSS modules, custom utilities, etc.)
    "tailwindcss/no-custom-classname": "off",
    // Disable shorthand enforcement to prevent w-[36px] h-[36px] from becoming size-[36px]
    "tailwindcss/enforces-shorthand": "off",
  },
  settings: {
    tailwindcss: {
      // These are the default values but you can customize them
      callees: ["classnames", "clsx", "cn"],
      config: "tailwind.config.js",
      cssFiles: [
        "**/*.css",
        "!**/node_modules",
        "!**/.*",
        "!**/dist",
        "!**/build",
      ],
      cssFilesRefreshRate: 5_000,
      removeDuplicates: true,
      skipClassAttribute: false,
      whitelist: [],
      tags: [],
      classRegex: "^(class(Name)?|cn)$",
    },
  },
};

module.exports = config;
