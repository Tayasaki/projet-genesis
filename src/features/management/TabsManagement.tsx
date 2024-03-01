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

export const TabsManagement = () => {
  return (
    <div className="flex space-x-2">
      <Tabs
        defaultValue="temperment"
        className="flex max-w-xl flex-col rounded-lg p-4 shadow-md dark:border"
      >
        <TabsList>
          <TabsTrigger value="temperment">Tempérament</TabsTrigger>
          <TabsTrigger value="alignement">Alignement</TabsTrigger>
          <TabsTrigger value="fortune">Richesse</TabsTrigger>
          <TabsTrigger value="strenght">Force</TabsTrigger>
          <TabsTrigger value="weakness">Faiblesse</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
        </TabsList>
        <TabsContent value="temperment">
          <TempermentForm />
        </TabsContent>
        <TabsContent value="alignement">
          <AlignementForm />
        </TabsContent>
        <TabsContent value="fortune">
          <FortuneForm />
        </TabsContent>
        <TabsContent value="strenght">
          <StrengthForm />
        </TabsContent>
        <TabsContent value="weakness">
          <WeaknessForm />
        </TabsContent>
        <TabsContent value="skills">
          <CharacterSkillForm />
        </TabsContent>
      </Tabs>

      <Tabs
        defaultValue="damage"
        className="flex max-w-lg flex-col rounded-lg p-4 shadow-md dark:border"
      >
        <TabsList>
          <TabsTrigger value="damage">Dégât</TabsTrigger>
          <TabsTrigger value="ammo">Munition</TabsTrigger>
          <TabsTrigger value="range">Porté</TabsTrigger>
          <TabsTrigger value="Weight">Poids</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
        </TabsList>
        <TabsContent value="damage">
          <DamageForm />
        </TabsContent>
        <TabsContent value="ammo">
          <AmmoForm />
        </TabsContent>
        <TabsContent value="range">
          <RangeForm />
        </TabsContent>
        <TabsContent value="Weight">
          <WeightForm />
        </TabsContent>
        <TabsContent value="skills">
          <WeaponSkillForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};
