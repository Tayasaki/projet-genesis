-- better-auth's Prisma adapter reads/writes User.emailVerified as a Boolean.
-- The column was left as the pre-migration (NextAuth-era) DateTime, causing
-- Prisma type-validation errors on sign-in / account-link.

-- 1. Add the new boolean column, backfilled from the old timestamp column
--    (a non-null timestamp meant "verified").
ALTER TABLE "User" ADD COLUMN "emailVerifiedBool" BOOLEAN NOT NULL DEFAULT false;
UPDATE "User" SET "emailVerifiedBool" = ("emailVerified" IS NOT NULL);

-- 2. Drop the old DateTime column and rename the new one into its place.
ALTER TABLE "User" DROP COLUMN "emailVerified";
ALTER TABLE "User" RENAME COLUMN "emailVerifiedBool" TO "emailVerified";
