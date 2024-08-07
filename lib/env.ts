import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  server: {
    GITHUB_ID: z.string().min(1),
    GITHUB_SECRET: z.string().min(1),
    DISCORD_ID: z.string().min(1),
    DISCORD_SECRET: z.string().min(1),
    GOOGLE_ID: z.string().min(1),
    GOOGLE_SECRET: z.string().min(1),
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
  },
});
