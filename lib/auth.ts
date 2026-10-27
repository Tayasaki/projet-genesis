import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { env } from "./env";
import { prisma } from "./prisma";
import { buildSocialProviders } from "./social-providers";
import { parseOriginList } from "./trusted-origins.mjs";

// better-auth already trusts baseURL's own origin automatically — this list
// is only for *additional* origins (e.g. a local /etc/hosts dev alias).
// Configure via TRUSTED_ORIGINS (comma-separated) instead of hardcoding one.
const trustedOrigins = parseOriginList(env.TRUSTED_ORIGINS);
const socialProviders = buildSocialProviders(env);

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
