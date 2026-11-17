"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { DisplayCharacter } from "@/components/features/layout/DisplayCharacter";
import { hasActionError } from "@/lib/action-result";
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
  const tCommon = useTranslations("common");
  return (
    <DisplayCharacter
      characterList={characters}
      renderActions={(c) => (
        <DeleteDialog
          item={c.name}
          deleteItem={async () => {
            const value = await deleteCharacter({ id: c.id });
            if (hasActionError(value)) {
              toast.error(tCommon("deleteFailed"));
              return;
            }
            toast.success(t("deletedSuccess", { name: c.name }));
          }}
        />
      )}
    />
  );
}
