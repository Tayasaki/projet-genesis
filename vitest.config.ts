import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      include: ["lib/utils.ts", "lib/ownership.ts", "src/actions/**/*.ts"],
      reporter: ["text", "text-summary"],
      thresholds: { statements: 95, branches: 90, functions: 95, lines: 95 },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
