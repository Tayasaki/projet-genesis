import { expect, test } from "@playwright/test";

test("creates a scenario and sees it in the list, then deletes it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Bienvenue" })).toBeVisible();

  const name = `E2E Scenario ${Date.now()}`;

  await page.getByLabel("Nom du scénario").fill(name);
  await page.getByLabel("Univers du scénario").fill("E2E Universe");
  await page.getByRole("button", { name: "Créer mon scénario" }).click();

  const link = page.getByRole("link", { name });
  await expect(link).toBeVisible();

  // Nearest ancestor div that also contains a button — the card itself,
  // regardless of how many other divs wrap the link (grid container, Card
  // root, etc).
  const card = link.locator("xpath=ancestor::div[.//button][1]");
  await card.getByRole("button").click();
  await page.getByRole("button", { name: "Supprimer" }).click();

  await expect(link).not.toBeVisible();
});
