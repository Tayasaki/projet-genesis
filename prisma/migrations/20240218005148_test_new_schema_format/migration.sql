/*
  Warnings:

  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkillSetCharacter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkillSetWeapon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `scenarioId` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `strengthId` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `weaknessId` on the `Character` table. All the data in the column will be lost.
  - Added the required column `pj` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Inventory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SkillSetCharacter";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SkillSetWeapon";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_CharacterToWeapon" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CharacterToWeapon_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterToWeapon_B_fkey" FOREIGN KEY ("B") REFERENCES "Weapon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CharacterToCharacterSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CharacterToCharacterSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterToCharacterSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "CharacterSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CharacterToScenario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CharacterToScenario_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterToScenario_B_fkey" FOREIGN KEY ("B") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CharacterToStrength" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CharacterToStrength_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterToStrength_B_fkey" FOREIGN KEY ("B") REFERENCES "Strength" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CharacterToWeakness" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CharacterToWeakness_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterToWeakness_B_fkey" FOREIGN KEY ("B") REFERENCES "Weakness" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_WeaponToWeaponSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_WeaponToWeaponSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Weapon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_WeaponToWeaponSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "WeaponSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pj" BOOLEAN NOT NULL,
    "age" INTEGER,
    "image" TEXT,
    "origin" TEXT,
    "role" TEXT,
    "injury" TEXT,
    "extra" TEXT,
    "fortuneId" TEXT,
    "alignmentId" TEXT,
    "tempermentId" TEXT,
    CONSTRAINT "Character_fortuneId_fkey" FOREIGN KEY ("fortuneId") REFERENCES "Fortune" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Character_alignmentId_fkey" FOREIGN KEY ("alignmentId") REFERENCES "Alignment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Character_tempermentId_fkey" FOREIGN KEY ("tempermentId") REFERENCES "Temperment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Character" ("age", "alignmentId", "extra", "fortuneId", "id", "image", "injury", "name", "origin", "role", "tempermentId") SELECT "age", "alignmentId", "extra", "fortuneId", "id", "image", "injury", "name", "origin", "role", "tempermentId" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterToWeapon_AB_unique" ON "_CharacterToWeapon"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterToWeapon_B_index" ON "_CharacterToWeapon"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterToCharacterSkill_AB_unique" ON "_CharacterToCharacterSkill"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterToCharacterSkill_B_index" ON "_CharacterToCharacterSkill"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterToScenario_AB_unique" ON "_CharacterToScenario"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterToScenario_B_index" ON "_CharacterToScenario"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterToStrength_AB_unique" ON "_CharacterToStrength"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterToStrength_B_index" ON "_CharacterToStrength"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterToWeakness_AB_unique" ON "_CharacterToWeakness"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterToWeakness_B_index" ON "_CharacterToWeakness"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_WeaponToWeaponSkill_AB_unique" ON "_WeaponToWeaponSkill"("A", "B");

-- CreateIndex
CREATE INDEX "_WeaponToWeaponSkill_B_index" ON "_WeaponToWeaponSkill"("B");
