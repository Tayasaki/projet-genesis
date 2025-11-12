-- AlterTable
ALTER TABLE "_CharacterToCharacterSkill" ADD CONSTRAINT "_CharacterToCharacterSkill_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CharacterToCharacterSkill_AB_unique";

-- AlterTable
ALTER TABLE "_CharacterToScenario" ADD CONSTRAINT "_CharacterToScenario_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CharacterToScenario_AB_unique";

-- AlterTable
ALTER TABLE "_CharacterToStrength" ADD CONSTRAINT "_CharacterToStrength_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CharacterToStrength_AB_unique";

-- AlterTable
ALTER TABLE "_CharacterToWeakness" ADD CONSTRAINT "_CharacterToWeakness_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CharacterToWeakness_AB_unique";

-- AlterTable
ALTER TABLE "_CharacterToWeapon" ADD CONSTRAINT "_CharacterToWeapon_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CharacterToWeapon_AB_unique";

-- AlterTable
ALTER TABLE "_WeaponToWeaponSkill" ADD CONSTRAINT "_WeaponToWeaponSkill_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_WeaponToWeaponSkill_AB_unique";
