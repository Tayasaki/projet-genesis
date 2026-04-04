import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  {
    ignores: [
      ".claude/**",
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
    ],
  },
  {
    extends: [...nextCoreWebVitals],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
]);
