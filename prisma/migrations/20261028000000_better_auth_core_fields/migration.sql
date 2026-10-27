-- Better Auth core fields (issue #52).
--
-- Adds the columns Better Auth writes on every sign-in that the schema never
-- had: user timestamps, session client info, and the account token-expiry
-- and password columns. accessTokenExpiresAt replaces the old Int
-- "expires_at" mapping (Better Auth writes a timestamp); "expires_at" is kept
-- untouched. "type" gets a default because Better Auth never writes it.
--
-- Additive and transactional (Prisma runs this file in one transaction on
-- Postgres): new nullable columns or columns with a default, plus one column
-- default. Nothing is dropped or rewritten, and a failure rolls everything
-- back. Existing users get createdAt/updatedAt = the migration time.

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "password" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ALTER COLUMN "type" SET DEFAULT 'oauth';

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
