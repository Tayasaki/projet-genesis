"use client";

import { AlignementForm } from "@/components/form/character/AlignementForm";
import { CharacterSkillForm } from "@/components/form/character/CharacterSkillForm";
import { FortuneForm } from "@/components/form/character/FortuneForm";
import { StrengthForm } from "@/components/form/character/StrengthForm";
import { TempermentForm } from "@/components/form/character/TempermentForm";
import { WeaknessForm } from "@/components/form/character/WeaknessForm";
import { AmmoForm } from "@/components/form/weapon/AmmoForm";
import { DamageForm } from "@/components/form/weapon/DamageForm";
import { RangeForm } from "@/components/form/weapon/RangeForm";
import { WeaponSkillForm } from "@/components/form/weapon/WeaponSkillForm";
import { WeightForm } from "@/components/form/weapon/WeightForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export const CharacterAttributeForms = ({
  isAuthorized,
}: {
  isAuthorized: boolean;
}) => {
  const t = useTranslations("manage");
  return (
    <Tabs defaultValue="temperment">
      <TabsList>
        <TabsTrigger value="temperment">{t("temperament")}</TabsTrigger>
        <TabsTrigger value="alignement">{t("alignment")}</TabsTrigger>
        <TabsTrigger value="fortune">{t("fortune")}</TabsTrigger>
        <TabsTrigger value="strenght">{t("strength")}</TabsTrigger>
        <TabsTrigger value="weakness">{t("weakness")}</TabsTrigger>
        <TabsTrigger value="skills">{t("skills")}</TabsTrigger>
      </TabsList>

      <TabsContent value="temperment">
        <TempermentForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="alignement">
        <AlignementForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="fortune">
        <FortuneForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="strenght">
        <StrengthForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="weakness">
        <WeaknessForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="skills">
        <CharacterSkillForm suggest={!isAuthorized} />
      </TabsContent>
    </Tabs>
  );
};

export const WeaponAttributeForms = ({
  isAuthorized,
}: {
  isAuthorized: boolean;
}) => {
  const t = useTranslations("manage");
  return (
    <Tabs defaultValue="damage">
      <TabsList>
        <TabsTrigger value="damage">{t("damage")}</TabsTrigger>
        <TabsTrigger value="ammo">{t("ammo")}</TabsTrigger>
        <TabsTrigger value="range">{t("range")}</TabsTrigger>
        <TabsTrigger value="Weight">{t("weight")}</TabsTrigger>
        <TabsTrigger value="skills">{t("skills")}</TabsTrigger>
      </TabsList>
      <TabsContent value="damage">
        <DamageForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="ammo">
        <AmmoForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="range">
        <RangeForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="Weight">
        <WeightForm suggest={!isAuthorized} />
      </TabsContent>
      <TabsContent value="skills">
        <WeaponSkillForm suggest={!isAuthorized} />
      </TabsContent>
    </Tabs>
  );
};
