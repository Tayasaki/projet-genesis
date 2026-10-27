-- Character gets an owner column (issue #30).
--
-- Additive and transactional (Prisma runs this file in one transaction on
-- Postgres): a nullable column, an index and a foreign key, plus an
-- idempotent backfill. Nothing is dropped or rewritten, and a failure rolls
-- everything back.

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill (fail-closed). A character was owned transitively through its
-- scenarios (implicit many-to-many "_CharacterToScenario": "A" = Character,
-- "B" = Scenario). Set "userId" ONLY when every scenario the character is
-- linked to belongs to one single user. Characters linked to scenarios of 2+
-- different users (cross-linked data from before PR #7) or to no scenario are
-- left NULL: an owner is never guessed. NULL-owner characters match no
-- ownership predicate, so nobody can read, edit, delete or link them until an
-- operator assigns an owner by hand.
UPDATE "Character" AS c
SET "userId" = o."userId"
FROM (
  SELECT j."A" AS "characterId", MIN(s."userId") AS "userId"
  FROM "_CharacterToScenario" AS j
  JOIN "Scenario" AS s ON s."id" = j."B"
  GROUP BY j."A"
  HAVING COUNT(DISTINCT s."userId") = 1
) AS o
WHERE c."id" = o."characterId"
  AND c."userId" IS NULL;

-- Audit query (read-only, NOT executed by this migration). Run it after
-- applying; every row it returns kept "userId" NULL and needs a manual
-- decision. "reason" is 'no-scenario' or 'cross-linked'; "owners" lists the
-- users of the linked scenarios.
--
--   SELECT c."id", c."name",
--          CASE WHEN COUNT(s."id") = 0 THEN 'no-scenario' ELSE 'cross-linked' END AS "reason",
--          ARRAY_REMOVE(ARRAY_AGG(DISTINCT s."userId"), NULL) AS "owners"
--   FROM "Character" AS c
--   LEFT JOIN "_CharacterToScenario" AS j ON j."A" = c."id"
--   LEFT JOIN "Scenario" AS s ON s."id" = j."B"
--   WHERE c."userId" IS NULL
--   GROUP BY c."id", c."name"
--   ORDER BY "reason", c."id";
--
-- To give a reviewed row an owner:
--   UPDATE "Character" SET "userId" = '<user id>' WHERE "id" = '<character id>';
