-- Deleting a Damage/Weight/Range/Ammo catalog entry used to cascade to every
-- user's weapons that referenced it (issue #104). Switch those foreign keys to
-- ON DELETE RESTRICT so the delete fails while the entry is in use.
-- Constraint-only change: no data is touched.

-- DropForeignKey
ALTER TABLE "Weapon" DROP CONSTRAINT "Weapon_damageId_fkey";
ALTER TABLE "Weapon" DROP CONSTRAINT "Weapon_weightId_fkey";
ALTER TABLE "Weapon" DROP CONSTRAINT "Weapon_rangeId_fkey";
ALTER TABLE "Weapon" DROP CONSTRAINT "Weapon_ammoId_fkey";

-- AddForeignKey
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_damageId_fkey" FOREIGN KEY ("damageId") REFERENCES "Damage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_weightId_fkey" FOREIGN KEY ("weightId") REFERENCES "Weight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_rangeId_fkey" FOREIGN KEY ("rangeId") REFERENCES "Range"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Weapon" ADD CONSTRAINT "Weapon_ammoId_fkey" FOREIGN KEY ("ammoId") REFERENCES "Ammo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
