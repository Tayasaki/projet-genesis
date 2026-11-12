"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { DisplayCharacter } from "@/components/features/layout/DisplayCharacter";
import { deleteCharacter } from "@/src/actions/character/character.action";
import { CharacterScenario } from "@/src/query/character.query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function MyCharactersGrid({
  characters,
}: {
  characters: CharacterScenario[];
}) {
  const t = useTranslations("myCharacters");
  return (
    <DisplayCharacter
      characterList={characters}
      renderActions={(c) => (
        <DeleteDialog
          item={c.name}
          deleteItem={async () => {
            await deleteCharacter({ id: c.id });
            toast.success(t("deletedSuccess", { name: c.name }));
          }}
        />
      )}
    />
  );
}
