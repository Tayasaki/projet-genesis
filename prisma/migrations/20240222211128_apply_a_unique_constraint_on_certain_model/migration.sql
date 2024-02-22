/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Alignment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Ammo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `CharacterSkill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Damage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Fortune` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Range` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Strength` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Temperment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Weakness` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `WeaponSkill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Weight` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Alignment_name_key" ON "Alignment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ammo_name_key" ON "Ammo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSkill_name_key" ON "CharacterSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Damage_name_key" ON "Damage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Fortune_name_key" ON "Fortune"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Range_name_key" ON "Range"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Strength_name_key" ON "Strength"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Temperment_name_key" ON "Temperment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Weakness_name_key" ON "Weakness"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WeaponSkill_name_key" ON "WeaponSkill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Weight_name_key" ON "Weight"("name");
