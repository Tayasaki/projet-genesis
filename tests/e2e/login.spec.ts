import { expect, test } from "@playwright/test";

/**
 * This environment has no real OAuth app credentials, so these tests verify
 * the login flow up to the external-provider boundary: the login page shows
 * all three providers, and clicking one makes the app correctly request an
 * authorize URL from Better Auth for that exact provider. Actually completing
 * an OAuth handshake against GitHub/Discord/Google is out of scope here.
 */
test.describe("login page", () => {
  test("shows all three OAuth provider buttons", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("button", { name: "Connectez vous avec Google" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Connectez vous avec Github" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Connectez vous avec Discord" }),
    ).toBeVisible();
  });

  for (const provider of ["github", "discord", "google"] as const) {
    test(`${provider} button requests a ${provider} authorize URL`, async ({
      page,
    }) => {
      // better-auth's client consumes the response body itself and then
      // auto-navigates to the returned authorize URL, both of which race
      // Playwright's CDP-based response.json() into "already consumed" /
      // "navigated away" errors. Routing the request ourselves (a separate
      // fetch, independent of the live page's resource lifecycle) sidesteps
      // both races.
      let body: { url?: string } | undefined;
      await page.route("**/api/auth/sign-in/social", async (route) => {
        const response = await route.fetch();
        body = await response.json();
        await route.fulfill({ response });
      });
      // Block the external navigation so it never leaves localhost.
      await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
      await page.goto("/login");

      await page
        .getByRole("button", {
          name: new RegExp(`Connectez vous avec ${provider}`, "i"),
        })
        .click();
      await expect.poll(() => body !== undefined).toBe(true);

      expect(body!.url).toContain(`${provider}.com`);
    });
  }
});
