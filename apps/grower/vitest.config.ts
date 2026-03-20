import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "../../test/setup.ts")],
    root: __dirname,
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
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./src"),
      "@cf/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@cf/api": path.resolve(__dirname, "../../packages/api/src"),
      "@cf/auth": path.resolve(__dirname, "../../packages/auth"),
      "@cf/common": path.resolve(__dirname, "../../packages/common/src"),
      "@cf/logger": path.resolve(__dirname, "../../packages/logger/src"),
    },
  },
});
