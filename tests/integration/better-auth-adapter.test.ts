// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

/**
 * Opt-in: drives Better Auth's own create paths through lib/auth.ts against a
 * real, fully migrated Postgres. CI has no database service, so this runs only
 * when AUTH_IT_DATABASE_URL points at a throwaway database:
 *
 *   AUTH_IT_DATABASE_URL=postgresql://u:p@localhost:5432/db pnpm exec vitest run tests/integration
 */
const databaseUrl = process.env.AUTH_IT_DATABASE_URL;

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

describe.skipIf(!databaseUrl)("Better Auth adapter against Postgres", () => {
  it("creates an OAuth user, its account and a session, then reads the session back", async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
    process.env.BETTER_AUTH_SECRET ??= "integration-test-secret-0123456789abcdef";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const ctx = await auth.$context;
    const email = `it-${Date.now()}@example.test`;

    try {
      const { user, account } = await ctx.internalAdapter.createOAuthUser(
        { name: "Integration", email, emailVerified: true, image: null },
        {
          providerId: "github",
          accountId: `gh-${Date.now()}`,
          accessToken: "access",
          refreshToken: "refresh",
          idToken: null,
          accessTokenExpiresAt: new Date(Date.now() + 3_600_000),
          refreshTokenExpiresAt: new Date(Date.now() + 86_400_000),
          scope: "read:user,user:email",
        },
      );
      expect(user.email).toBe(email);
      expect(account?.userId).toBe(user.id);

      const session = await ctx.internalAdapter.createSession(user.id);
      expect(session.userId).toBe(user.id);

      const stored = await prisma.session.findUniqueOrThrow({
        where: { sessionToken: session.token },
        select: { ipAddress: true, userAgent: true },
      });
      expect(stored).toEqual({ ipAddress: null, userAgent: null });

      const found = await ctx.internalAdapter.findSession(session.token);
      expect(found?.user.id).toBe(user.id);
      expect(found?.session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    } finally {
      await prisma.user.deleteMany({ where: { email } });
      await prisma.$disconnect();
    }
  });
});
