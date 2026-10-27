-- Better Auth core fields.
--
-- Adds the columns Better Auth writes on every sign-in that the schema never
-- had: user timestamps, session client info, and the account token-expiry
-- and password columns. accessTokenExpiresAt replaces the old Int
-- "expires_at" mapping (Better Auth writes a timestamp); "expires_at" is kept
-- untouched. "type" gets a default because Better Auth never writes it.
--
-- Additive and idempotent: every column is nullable or has a default, and
-- ADD COLUMN IF NOT EXISTS skips a column a database already has (e.g. one
-- provisioned with `prisma db push`), so a re-run after a partial failure
-- succeeds. A pre-existing column of a different type is skipped silently:
-- run `prisma migrate diff --exit-code` after deploying. Nothing is dropped
-- or rewritten. Existing users get createdAt/updatedAt = the migration time.

-- Account
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "Account" ALTER COLUMN "type" SET DEFAULT 'oauth';

-- Session
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
