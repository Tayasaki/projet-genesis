-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "universe" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CharacterSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fortune" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Fortune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alignment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Alignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temperment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Temperment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strength" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Strength_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weakness" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Weakness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "melee" BOOLEAN NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "damageId" TEXT NOT NULL,
    "weightId" TEXT NOT NULL,
    "rangeId" TEXT NOT NULL,
    "ammoId" TEXT,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeaponSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "WeaponSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Damage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Damage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weight" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Weight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ammo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ammo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Range" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Range_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CharacterToWeapon" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CharacterToCharacterSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CharacterToScenario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CharacterToStrength" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CharacterToWeakness" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_WeaponToWeaponSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSkill_name_key" ON "CharacterSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Fortune_name_key" ON "Fortune"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Alignment_name_key" ON "Alignment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Temperment_name_key" ON "Temperment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Strength_name_key" ON "Strength"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Weakness_name_key" ON "Weakness"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponSkill_name_key" ON "WeaponSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Damage_name_key" ON "Damage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Weight_name_key" ON "Weight"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ammo_name_key" ON "Ammo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Range_name_key" ON "Range"("name");

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

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_fortuneId_fkey" FOREIGN KEY ("fortuneId") REFERENCES "Fortune"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_alignmentId_fkey" FOREIGN KEY ("alignmentId") REFERENCES "Alignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_tempermentId_fkey" FOREIGN KEY ("tempermentId") REFERENCES "Temperment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_damageId_fkey" FOREIGN KEY ("damageId") REFERENCES "Damage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_weightId_fkey" FOREIGN KEY ("weightId") REFERENCES "Weight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_rangeId_fkey" FOREIGN KEY ("rangeId") REFERENCES "Range"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_ammoId_fkey" FOREIGN KEY ("ammoId") REFERENCES "Ammo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToWeapon" ADD CONSTRAINT "_CharacterToWeapon_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToWeapon" ADD CONSTRAINT "_CharacterToWeapon_B_fkey" FOREIGN KEY ("B") REFERENCES "Weapon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToCharacterSkill" ADD CONSTRAINT "_CharacterToCharacterSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToCharacterSkill" ADD CONSTRAINT "_CharacterToCharacterSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "CharacterSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToScenario" ADD CONSTRAINT "_CharacterToScenario_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToScenario" ADD CONSTRAINT "_CharacterToScenario_B_fkey" FOREIGN KEY ("B") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToStrength" ADD CONSTRAINT "_CharacterToStrength_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToStrength" ADD CONSTRAINT "_CharacterToStrength_B_fkey" FOREIGN KEY ("B") REFERENCES "Strength"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToWeakness" ADD CONSTRAINT "_CharacterToWeakness_A_fkey" FOREIGN KEY ("A") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CharacterToWeakness" ADD CONSTRAINT "_CharacterToWeakness_B_fkey" FOREIGN KEY ("B") REFERENCES "Weakness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WeaponToWeaponSkill" ADD CONSTRAINT "_WeaponToWeaponSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Weapon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WeaponToWeaponSkill" ADD CONSTRAINT "_WeaponToWeaponSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "WeaponSkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
