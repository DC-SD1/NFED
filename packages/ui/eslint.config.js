import js from "@eslint/js";
import react from "eslint-plugin-react";

export default js.config({
  ignores: [
    "node_modules/**",
    "dist/**",
    "src/alert.tsx",
    "src/animated-tooltip.tsx",
    "src/button.tsx",
    "src/container-scroll-animation.tsx",
    "src/data-table.tsx",
    "src/following-pointer.tsx",
    "src/form.tsx",
    "src/globe.tsx",
    "src/glowing-effect.tsx",
    "src/label.tsx",
    "src/marquee.tsx",
    "src/sheet.tsx",
    "src/sparkles.tsx",
    "src/table.tsx",
    "src/text-reveal.tsx",
    "src/toast.tsx",
    "src/utils/**",
  ],

  plugins: {
    react,
  },

  rules: {
    "react/react-in-jsx-scope": "off",
  },

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },

  env: {
    browser: true,
    node: true,
    es2021: true,
  },

  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: {
        "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      },
      rules: {},
    },
  ],
});
