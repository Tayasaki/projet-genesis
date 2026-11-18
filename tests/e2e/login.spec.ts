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

test.describe("legal pages for anonymous visitors", () => {
  test("login page shows the consent notice linking to both legal pages", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(
      page.getByText(
        "En vous connectant, vous acceptez les CGU et la politique de confidentialité.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "CGU", exact: true }),
    ).toHaveAttribute("href", "/tos");
    await expect(
      page.getByRole("link", {
        name: "politique de confidentialité",
        exact: true,
      }),
    ).toHaveAttribute("href", "/privacy-policy");
  });

  test("the consent notice's CGU link opens the terms, not /login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "CGU", exact: true }).click();

    await expect(page).toHaveURL(/\/tos$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Conditions générales d'utilisation de Projet-Genesis",
      }),
    ).toBeVisible();
  });

  test("the consent notice's privacy link opens the policy, not /login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page
      .getByRole("link", { name: "politique de confidentialité", exact: true })
      .click();

    await expect(page).toHaveURL(/\/privacy-policy$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Politique de Confidentialité de Projet-Genesis",
      }),
    ).toBeVisible();
  });

  test("the footer terms link reaches /tos for an anonymous visitor", async ({
    page,
  }) => {
    await page.goto("/login");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Conditions d'utilisation" })
      .click();

    await expect(page).toHaveURL(/\/tos$/);
  });
});
