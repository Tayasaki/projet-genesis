import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { env } from "./env";
import { prisma } from "./prisma";

// better-auth already trusts baseURL's own origin automatically — this list
// is only for *additional* origins (e.g. a local /etc/hosts dev alias).
// Configure via TRUSTED_ORIGINS (comma-separated) instead of hardcoding one.
const trustedOrigins = env.TRUSTED_ORIGINS
  ? env.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string } & Record<string, unknown>
> = {};
if (env.GITHUB_ID && env.GITHUB_SECRET) {
  socialProviders.github = {
    clientId: env.GITHUB_ID,
    clientSecret: env.GITHUB_SECRET,
  };
}
if (env.DISCORD_ID && env.DISCORD_SECRET) {
  socialProviders.discord = {
    clientId: env.DISCORD_ID,
    clientSecret: env.DISCORD_SECRET,
  };
}
if (env.GOOGLE_ID && env.GOOGLE_SECRET) {
  socialProviders.google = {
    prompt: "select_account consent",
    accessType: "offline",
    clientId: env.GOOGLE_ID,
    clientSecret: env.GOOGLE_SECRET,
  };
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders,
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
