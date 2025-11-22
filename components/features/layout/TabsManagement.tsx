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

export const TabsManagement = ({ isAuthorized }: { isAuthorized: boolean }) => {
  return (
    <div className="flex space-x-2">
      <div>
        <h3 className="dark:text-primary mb-3 text-xl">
          Créer des attributs de personnages
        </h3>
        <Tabs defaultValue="temperment">
          <TabsList>
            <TabsTrigger value="temperment">Tempérament</TabsTrigger>
            <TabsTrigger value="alignement">Alignement</TabsTrigger>
            <TabsTrigger value="fortune">Richesse</TabsTrigger>
            <TabsTrigger value="strenght">Force</TabsTrigger>
            <TabsTrigger value="weakness">Faiblesse</TabsTrigger>
            <TabsTrigger value="skills">Compétences</TabsTrigger>
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
      </div>

      <div>
        <h3 className="dark:text-primary mb-3 text-xl">
          Créer des attributs d&apos;armes
        </h3>
        <Tabs defaultValue="damage">
          <TabsList>
            <TabsTrigger value="damage">Dégât</TabsTrigger>
            <TabsTrigger value="ammo">Munition</TabsTrigger>
            <TabsTrigger value="range">Porté</TabsTrigger>
            <TabsTrigger value="Weight">Poids</TabsTrigger>
            <TabsTrigger value="skills">Compétences</TabsTrigger>
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
      </div>
    </div>
  );
};
