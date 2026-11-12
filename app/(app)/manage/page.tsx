import { PageHeader } from "@/components/ui/page-header";
import {
  CharacterAttributeForms,
  WeaponAttributeForms,
} from "@/components/features/layout/TabsManagement";
import { WeaponForm } from "@/components/form/weapon/WeaponForm";
import { FormPanel } from "@/components/ui/form-panel";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { CharacterAttributesTable } from "./characterAttributesColumns";
import { WeaponAttributesTable } from "./weaponAttributesColumns";
import { WeaponsTable } from "./weaponColumns";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return { title: t("manage"), description: t("appDescription") };
}

const panelTabsClass = "mt-6 border-0 bg-transparent p-0";

export default async function Manage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  const isAuthorized = user.role === "ADMIN" || user.role === "SUPERUSER";
  const t = await getTranslations("manage");

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

  temperments.map((t) =>
    characterAttributes.push({ ...t, type: "temperment" }),
  );
  alignements.map((a) =>
    characterAttributes.push({ ...a, type: "alignement" }),
  );
  fortunes.map((f) => characterAttributes.push({ ...f, type: "fortune" }));
  strengths.map((s) => characterAttributes.push({ ...s, type: "strength" }));
  weaknesses.map((w) => characterAttributes.push({ ...w, type: "weakness" }));
  characterSkills.map((c) => characterAttributes.push({ ...c, type: "skill" }));

  ammo.map((a) => weaponAttributes.push({ ...a, type: "ammo" }));
  damage.map((d) => weaponAttributes.push({ ...d, type: "damage" }));
  range.map((r) => weaponAttributes.push({ ...r, type: "range" }));
  weight.map((w) => weaponAttributes.push({ ...w, type: "weight" }));
  weaponSkill.map((w) => weaponAttributes.push({ ...w, type: "skill" }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("title")} description={t("description")} />
      <Tabs defaultValue="characters">
        <TabsList>
          <TabsTrigger value="characters">{t("personnages")}</TabsTrigger>
          <TabsTrigger value="weapons">{t("armes")}</TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className={panelTabsClass}>
          <div className="grid gap-8 lg:grid-cols-2">
            <CharacterAttributesTable
              data={characterAttributes}
              title={t("characterAttributes")}
            />
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                {t("createAttribute")}
              </h3>
              <CharacterAttributeForms isAuthorized={isAuthorized} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weapons" className={panelTabsClass}>
          <div className="flex flex-col gap-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <WeaponsTable data={weapons} title={t("weapons")} />
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  {t("createWeapon")}
                </h3>
                <FormPanel>
                  <WeaponForm
                    ammos={ammo}
                    damages={damage}
                    ranges={range}
                    weights={weight}
                    skills={weaponSkill}
                  />
                </FormPanel>
              </div>
            </div>
            <Separator />
            <div className="grid gap-8 lg:grid-cols-2">
              <WeaponAttributesTable
                data={weaponAttributes}
                title={t("weaponAttributes")}
              />
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  {t("createWeaponAttribute")}
                </h3>
                <WeaponAttributeForms isAuthorized={isAuthorized} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
