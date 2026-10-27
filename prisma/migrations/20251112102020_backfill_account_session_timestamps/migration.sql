-- Fix-up for 20251112102019_migration_to_better_auth, which added
-- Account.updatedAt / Session.updatedAt as NOT NULL with no default. That
-- migration fails (P3018/23502) on any table with existing rows, because a
-- bare NOT NULL ADD COLUMN backfills nothing. This migration adds the
-- column nullable, backfills existing rows to now() (matching the
-- @updatedAt Prisma semantics — "last write" is unknown for pre-existing
-- rows, so now() is the least-wrong value), then tightens to NOT NULL.
-- See documentation/runbooks/prisma-p3009-preview-db-recovery.md.

-- Account
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
UPDATE "Account" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
ALTER TABLE "Account" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Session
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
UPDATE "Session" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
ALTER TABLE "Session" ALTER COLUMN "updatedAt" SET NOT NULL;
