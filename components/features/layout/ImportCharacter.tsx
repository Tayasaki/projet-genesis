"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { hasActionError } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import { UserX } from "lucide-react";
import { updateScenarioCharacter } from "@/src/actions/scenario.action";
import { Character } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

type SelectableCharacter = Character & {
  selected: boolean;
};

export const ImportCharacter = ({
  characterList,
  scenarioId,
}: {
  characterList: Character[];
  scenarioId: string;
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<
    SelectableCharacter[]
  >(() => characterList.map((c) => ({ ...c, selected: false })));

  function selectCharacter(character: Character) {
    const copySelectedCharacter = [...selectedCharacter];
    const c = copySelectedCharacter.find((c) => c.id === character.id);
    if (!c) {
      toast.error("Une erreur est survenue");
      return;
    }
    c.selected = !c?.selected;
    setSelectedCharacter(copySelectedCharacter);
  }

  async function importCharacter(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const characterToImport = selectedCharacter.filter((c) => c.selected);
    for (const character of characterToImport) {
      const value = await updateScenarioCharacter({
        scenarioId: scenarioId,
        characterId: character.id,
      });
      if (hasActionError(value)) {
        toast.error("Une erreur est survenue");
      } else {
        toast.success(`${character.name} a été importé avec succès 🧙`);
      }
    }
  }

  return (
    <div>
      <ScrollArea className="h-72 w-full p-5">
        {selectedCharacter.length === 0 ? (
          <EmptyState icon={UserX} title="Aucun personnage trouvé" />
        ) : (
          <div className="flex flex-col gap-3">
            {selectedCharacter.map((character) => (
              <Card
                key={character.id}
                className={cn(
                  "hover:border-primary/40 cursor-pointer transition-colors",
                  character.selected && "border-primary",
                )}
                onClick={() => selectCharacter(character)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold">
                    {character.name}
                  </CardTitle>
                  <Checkbox
                    checked={character.selected}
                    onCheckedChange={() => selectCharacter(character)}
                    onClick={(event) => event.stopPropagation()}
                  />
                </CardHeader>
                <CardContent className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {character.age != null && <span>Âge : {character.age} ans</span>}
                  {character.origin && <span>Origine : {character.origin}</span>}
                  {character.role && <span>Rôle : {character.role}</span>}
                  {character.extra && <span>Extra : {character.extra}</span>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ScrollBar orientation="vertical" />
      </ScrollArea>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Annuler</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            disabled={!selectedCharacter.some((c) => c.selected)}
            onClick={importCharacter}
          >
            Importer
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};
