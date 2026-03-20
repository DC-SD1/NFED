import { defineConfig, defineProject } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      defineProject({
        test: {
          name: "buyer",
          root: path.resolve(__dirname, "apps/buyer"),
          environment: "jsdom",
          globals: true,
          setupFiles: path.resolve(__dirname, "apps/buyer/src/test-setup.ts"),
          pool: "forks",
        },
        resolve: {
          alias: [
            {
              find: "@",
              replacement: path.resolve(__dirname, "apps/buyer/src"),
            },
          ],
        },
        plugins: [react()],
      }),
      defineProject({
        test: {
          name: "grower",
          root: path.resolve(__dirname, "apps/grower"),
          environment: "jsdom",
          globals: true,
          pool: "forks",
        },
        plugins: [react()],
      }),
    ],
  },
});

