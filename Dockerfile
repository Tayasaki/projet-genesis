FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# Build-time placeholders only (builder stage; not inherited by the runner stage).
# Override with --build-arg; real values must be supplied at runtime.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG BETTER_AUTH_URL=http://localhost:3000
ARG AUTH_GITHUB_ID=build-placeholder
ARG AUTH_GITHUB_SECRET=build-placeholder
ARG AUTH_DISCORD_ID=build-placeholder
ARG AUTH_DISCORD_SECRET=build-placeholder
ARG AUTH_GOOGLE_ID=build-placeholder
ARG AUTH_GOOGLE_SECRET=build-placeholder
ENV DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    AUTH_GITHUB_ID=$AUTH_GITHUB_ID \
    AUTH_GITHUB_SECRET=$AUTH_GITHUB_SECRET \
    AUTH_DISCORD_ID=$AUTH_DISCORD_ID \
    AUTH_DISCORD_SECRET=$AUTH_DISCORD_SECRET \
    AUTH_GOOGLE_ID=$AUTH_GOOGLE_ID \
    AUTH_GOOGLE_SECRET=$AUTH_GOOGLE_SECRET

RUN corepack enable pnpm && pnpm prisma generate
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY /prisma/schema.prisma ./

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js