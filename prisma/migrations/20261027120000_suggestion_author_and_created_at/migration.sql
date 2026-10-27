-- Adds suggestion authorship and a creation timestamp (rate-limit window).
-- Additive only: existing rows keep userId NULL and get createdAt = migration time.
-- No data is dropped or rewritten; Prisma runs the file in one transaction.

-- AlterTable
ALTER TABLE "Suggestion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Suggestion_userId_createdAt_idx" ON "Suggestion"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
