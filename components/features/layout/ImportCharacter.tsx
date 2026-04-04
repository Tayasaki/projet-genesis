"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
      if (value?.validationErrors || value?.serverError) {
        toast.error("Une erreur est survenue");
      } else {
        toast.success(`${character.name} a été importé avec succès 🧙`);
      }
    }
  }

  return (
    <div>
      <ScrollArea className="h-72 w-full p-6">
        {selectedCharacter.length === 0 ? (
          <p className="text-muted-foreground text-center text-sm">
            Aucun personnage trouvé
          </p>
        ) : (
          selectedCharacter.map((character) => (
            <Card
              key={character.id}
              className={cn(
                "m-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-100",
                character.selected ? "border-primary" : "",
              )}
              onClick={() => selectCharacter(character)}
            >
              <CardHeader className="flex flex-row justify-between">
                <CardTitle>{character.name}</CardTitle>
                <div className="flex items-center space-x-2 italic">
                  <p>{character.selected ? "Sélectionné" : ""}</p>
                  <Checkbox
                    checked={character.selected}
                    onCheckedChange={() => selectCharacter(character)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <p>
                    Age:{" "}
                    <code className="text-primary">{character.age} ans</code>
                  </p>
                  <p>
                    Origine:{" "}
                    <code className="text-primary">{character.origin}</code>
                  </p>
                </div>
                <p>
                  Rôle: <code className="text-primary">{character.role}</code>
                </p>
                <p>
                  Extra: <code className="text-primary">{character.extra}</code>
                </p>
              </CardContent>
            </Card>
          ))
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
