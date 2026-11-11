import { test as setup } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import { e2eAuth } from "./support/auth-test-instance";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page, baseURL }) => {
  const email = `e2e-${Date.now()}@example.test`;
  const user = await prisma.user.create({
    data: { email, name: "E2E User", emailVerified: true },
  });

  const ctx = await e2eAuth.$context;
  const { cookies } = await ctx.test.login({ userId: user.id });
  const domain = new URL(baseURL!).hostname;

  await page.context().addCookies(
    cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain,
      path: cookie.path ?? "/",
      httpOnly: cookie.httpOnly ?? true,
      secure: cookie.secure ?? false,
      sameSite: cookie.sameSite === "None" ? "None" : cookie.sameSite === "Strict" ? "Strict" : "Lax",
      expires: cookie.expires,
    })),
  );

  await page.goto("/");
  await page.waitForURL("/");

  await page.context().storageState({ path: authFile });
});
