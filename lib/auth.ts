import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { env } from "./env";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: ["http://app.dev.local"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    },
    discord: {
      clientId: env.DISCORD_ID,
      clientSecret: env.DISCORD_SECRET,
    },
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    },
  },
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
      accessTokenExpiresAt: "expires_at",
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

export const getAuthSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};
