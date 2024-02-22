"use client";

import { AlignementForm } from "@/components/form/AlignementForm";
import { CharacterSkillForm } from "@/components/form/CharacterSkillForm";
import { FortuneForm } from "@/components/form/FortuneForm";
import { StrengthForm } from "@/components/form/StrengthForm";
import { TempermentForm } from "@/components/form/TempermentForm";
import { WeaknessForm } from "@/components/form/WeaknessForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TabsManagement = ({ userId }: { userId: string }) => {
  return (
    <Tabs
      defaultValue="temperment"
      className="flex flex-col p-4 bg-white rounded-lg shadow-md w-96"
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
        <TempermentForm userId={userId} />
      </TabsContent>
      <TabsContent value="alignement">
        <AlignementForm userId={userId} />
      </TabsContent>
      <TabsContent value="fortune">
        <FortuneForm userId={userId} />
      </TabsContent>
      <TabsContent value="strenght">
        <StrengthForm userId={userId} />
      </TabsContent>
      <TabsContent value="weakness">
        <WeaknessForm userId={userId} />
      </TabsContent>
      <TabsContent value="skills">
        <CharacterSkillForm userId={userId} />
      </TabsContent>
    </Tabs>
  );
};
