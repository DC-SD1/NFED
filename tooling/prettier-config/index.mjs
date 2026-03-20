import { fileURLToPath } from "url";

/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  plugins: [
    // Import sorting is handled by ESLint's simple-import-sort plugin
    // "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  tailwindConfig: fileURLToPath(
    new URL("../../tooling/tailwind-config/index.ts", import.meta.url),
  ),
  // Disable shorthand conversion to prevent w-[36px] h-[36px] from becoming size-[36px]
  tailwindFunctions: ["clsx", "cn", "classnames"],
  // Import order configuration removed - handled by ESLint
  // importOrder: [
  //   "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
  //   "^(next/(.*)$)|^(next$)",
  //   "<THIRD_PARTY_MODULES>",
  //   "",
  //   "^@cf/(.*)$",
  //   "",
  //   "^@/",
  //   "^[../]",
  //   "^[./]",
  // ],
  // importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  // importOrderTypeScriptVersion: "5.4.5",
};

export default config;
