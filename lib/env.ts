import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    DISCORD_ID: z.string().optional(),
    DISCORD_SECRET: z.string().optional(),
    GOOGLE_ID: z.string().optional(),
    GOOGLE_SECRET: z.string().optional(),
    BETTER_AUTH_URL: z.string().min(1),
    TRUSTED_ORIGINS: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    GITHUB_ID: process.env.AUTH_GITHUB_ID,
    GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    DISCORD_ID: process.env.AUTH_DISCORD_ID,
    DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
  },
});
