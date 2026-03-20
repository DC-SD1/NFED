import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "e2e/**",
      "**/e2e/**",
      "playwright-report/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "**/[.]**",
        "**/*.d.ts",
        "**/*{.,-}{test,spec}.?(c|m)[jt]s?(x)",
        "**/node_modules/**",
        "**/cypress/**",
        "test{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}",
        "**/__tests__/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "**/vitest.{workspace,config}.*",
        "**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@cf/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@cf/api": path.resolve(__dirname, "../../packages/api/src"),
      "@cf/auth": path.resolve(__dirname, "../../packages/auth"),
      "@cf/common": path.resolve(__dirname, "../../packages/common/src"),
    },
  },
});
