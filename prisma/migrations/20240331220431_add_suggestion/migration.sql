-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('Temperment', 'Alignment', 'Fortune', 'Strength', 'Weakness', 'CharacterSkill', 'WeaponSkill', 'Range', 'Damage', 'Weight', 'Ammo');

-- CreateTable
CREATE TABLE "Suggestion" (
    "type" "SuggestionType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("name")
);
