import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { testUtils } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

/**
 * Test-only Better Auth instance for E2E setup: same DB field mapping as
 * lib/auth.ts, plus the testUtils plugin (better-auth's own documented E2E
 * helper — see its docblock) to mint a real, correctly-signed session cookie
 * without going through a real OAuth provider. Never imported by app code.
 */
export const e2eAuth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: false },
  plugins: [testUtils()],
  session: {
    fields: {
      expiresAt: "expires",
      token: "sessionToken",
    },
  },
  account: {
    fields: {
      accountId: "providerAccountId",
      refreshToken: "refresh_token",
      accessToken: "access_token",
      idToken: "id_token",
      providerId: "provider",
    },
  },
  user: {
    fields: {
      emailVerified: "emailVerified",
    },
  },
});
