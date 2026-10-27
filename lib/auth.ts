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

/**
 * The privacy policy lists only name, email, photo and OAuth id as collected,
 * so the client IP and user agent Better Auth records on each session are
 * dropped before the row is written. The columns stay because Better Auth
 * requires them. IP tracking itself stays on: the rate limiter needs it.
 */
export async function withoutClientInfo<T extends object>(session: T) {
  return { data: { ...session, ipAddress: null, userAgent: null } };
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
  databaseHooks: {
    session: {
      create: { before: withoutClientInfo },
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
