import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ?? "3100";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testIgnore: /login\.spec\.ts/,
    },
    {
      name: "chromium-unauthenticated",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /login\.spec\.ts/,
    },
  ],
  webServer: {
    command: `pnpm exec next dev --turbopack --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      BETTER_AUTH_URL: baseURL,
      // Fake-but-syntactically-valid credentials so each provider button
      // produces a real authorize-URL redirect to assert against (see
      // login.spec.ts) — overridable, never used to complete a real OAuth
      // handshake in these tests.
      AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID ?? "e2e-github-id",
      AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET ?? "e2e-github-secret",
      AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID ?? "e2e-discord-id",
      AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET ?? "e2e-discord-secret",
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ?? "e2e-google-id",
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ?? "e2e-google-secret",
    },
  },
});
