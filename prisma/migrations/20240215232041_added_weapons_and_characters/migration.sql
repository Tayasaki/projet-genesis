-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "universe" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "image" TEXT,
    "origin" TEXT,
    "role" TEXT,
    "injury" TEXT,
    "extra" TEXT,
    "scenarioId" TEXT NOT NULL,
    "fortuneId" TEXT NOT NULL,
    "alignmentId" TEXT NOT NULL,
    "tempermentId" TEXT NOT NULL,
    "strengthId" TEXT NOT NULL,
    "weaknessId" TEXT NOT NULL,
    CONSTRAINT "Character_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_fortuneId_fkey" FOREIGN KEY ("fortuneId") REFERENCES "Fortune" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_alignmentId_fkey" FOREIGN KEY ("alignmentId") REFERENCES "Alignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_tempermentId_fkey" FOREIGN KEY ("tempermentId") REFERENCES "Temperment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_strengthId_fkey" FOREIGN KEY ("strengthId") REFERENCES "Strength" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_weaknessId_fkey" FOREIGN KEY ("weaknessId") REFERENCES "Weakness" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fortune" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Alignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Temperment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Strength" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Weakness" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SkillSetCharacter" (
    "characterId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    PRIMARY KEY ("characterId", "skillId"),
    CONSTRAINT "SkillSetCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SkillSetCharacter_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "CharacterSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inventory" (
    "characterId" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,

    PRIMARY KEY ("characterId", "weaponId"),
    CONSTRAINT "Inventory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inventory_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "melee" BOOLEAN NOT NULL,
    "description" TEXT,
    "damageId" TEXT NOT NULL,
    "weightId" TEXT NOT NULL,
    "rangeId" TEXT NOT NULL,
    "ammoId" TEXT,
    CONSTRAINT "Weapon_damageId_fkey" FOREIGN KEY ("damageId") REFERENCES "Damage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Weapon_weightId_fkey" FOREIGN KEY ("weightId") REFERENCES "Weight" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Weapon_rangeId_fkey" FOREIGN KEY ("rangeId") REFERENCES "Range" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Weapon_ammoId_fkey" FOREIGN KEY ("ammoId") REFERENCES "Ammo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Damage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Weight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Ammo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Range" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WeaponSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SkillSetWeapon" (
    "weaponId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    PRIMARY KEY ("weaponId", "skillId"),
    CONSTRAINT "SkillSetWeapon_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "Weapon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SkillSetWeapon_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "WeaponSkill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
