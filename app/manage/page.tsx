import { TabsManagement } from "@/components/features/layout/TabsManagement";
import { getAuthSession } from "@/lib/auth";
import {
  getAlignments,
  getCharacterSkills,
  getFortunes,
  getStrengths,
  getTemperments,
  getWeaknesses,
} from "@/src/query/character.query";
import {
  getAmmos,
  getDamages,
  getRanges,
  getWeaponSkill,
  getWeights,
} from "@/src/query/weapon.query";
import { redirect } from "next/navigation";
import { columns as characterColumns } from "./characterAttributesColumns";
import { DataTable } from "./data-table";
import { columns as weaponColumns } from "./weaponAttributesColumns";

export type CharacterAttributes = {
  id: string;
  name: string;
  type: string;
  description?: string | null;
};

export type WeaponAttributes = {
  id: string;
  name: string;
  type: string;
};

export default async function Manage() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");

  const characterAttributes: CharacterAttributes[] = [];
  const weaponAttributes: WeaponAttributes[] = [];
  const temperments = await getTemperments();
  const alignements = await getAlignments();
  const fortunes = await getFortunes();
  const strengths = await getStrengths();
  const weaknesses = await getWeaknesses();
  const characterSkills = await getCharacterSkills();
  const ammo = await getAmmos();
  const damage = await getDamages();
  const range = await getRanges();
  const weight = await getWeights();
  const weaponSkill = await getWeaponSkill();

  temperments.flatMap((t) =>
    characterAttributes.push({ ...t, type: "temperment" }),
  );
  alignements.flatMap((a) =>
    characterAttributes.push({ ...a, type: "alignement" }),
  );
  fortunes.flatMap((f) => characterAttributes.push({ ...f, type: "fortune" }));
  strengths.flatMap((s) =>
    characterAttributes.push({ ...s, type: "strength" }),
  );
  weaknesses.flatMap((w) =>
    characterAttributes.push({ ...w, type: "weakness" }),
  );
  characterSkills.flatMap((c) =>
    characterAttributes.push({ ...c, type: "skill" }),
  );

  ammo.flatMap((a) => weaponAttributes.push({ ...a, type: "ammo" }));
  damage.flatMap((d) => weaponAttributes.push({ ...d, type: "damage" }));
  range.flatMap((r) => weaponAttributes.push({ ...r, type: "range" }));
  weight.flatMap((w) => weaponAttributes.push({ ...w, type: "weight" }));
  weaponSkill.flatMap((w) => weaponAttributes.push({ ...w, type: "skill" }));

  return (
    <div className="w-full">
      <div className="flex w-full flex-col">
        <DataTable columns={characterColumns} data={characterAttributes} />
        <DataTable columns={weaponColumns} data={weaponAttributes} />
      </div>
      <TabsManagement />
    </div>
  );
}
