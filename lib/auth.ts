import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { env } from "./env";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
    },
  },
});

export const getAuthSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });
