import { TabsManagement } from "@/components/features/layout/TabsManagement";
import { WeaponForm } from "@/components/form/weapon/WeaponForm";
import { Separator } from "@/components/ui/separator";
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
  getWeapons,
  getWeights,
} from "@/src/query/weapon.query";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { columns as characterAttributesColumns } from "./characterAttributesColumns";
import { DataTable } from "./data-table";
import { columns as weaponAttributesColumns } from "./weaponAttributesColumns";
import { columns as weaponColumns } from "./weaponColumns";
import { prisma } from "@/lib/prisma";

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

export const metadata: Metadata = {
  title: "Projet Genesis - Armes | Attributs",
  description:
    "Création de scénarios pour jeux de rôle | Générateur de fiche de personnage",
};

export default async function Manage() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  const isAuthorized = user.role === "ADMIN" || user.role === "SUPERUSER";

  const characterAttributes: CharacterAttributes[] = [];
  const weaponAttributes: WeaponAttributes[] = [];
  const weapons = await getWeapons(session.user.id);
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
    <div className="space-y-4">
      <div className="flex flex-col">
        <DataTable
          columns={characterAttributesColumns}
          data={characterAttributes}
          title="Attributs de personnage"
        />
        <Separator />
        <DataTable
          columns={weaponAttributesColumns}
          data={weaponAttributes}
          title="Attributs d'arme"
        />
        <Separator />
        <DataTable columns={weaponColumns} data={weapons} title="Armes" />
      </div>
      <h2 className="text-2xl font-semibold underline underline-offset-8 dark:text-primary">
        Créer une arme
      </h2>
      <WeaponForm
        ammos={ammo}
        damages={damage}
        ranges={range}
        weights={weight}
        skills={weaponSkill}
      />
      <Separator />
      <TabsManagement isAuthorized={isAuthorized} />
    </div>
  );
}
