"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CharacterScenario } from "@/src/query/character.query";
import { PenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { CharacterDetails } from "./CharacterDetails";

export const CharacterModal = ({
  character,
}: {
  character: CharacterScenario;
}) => {
  const t = useTranslations("characterCard");
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Dialog
      open={pathname === `/characters/${character.id}`}
      onOpenChange={() => router.back()}
    >
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogTitle className="sr-only">{character.name}</DialogTitle>
        <CharacterDetails character={character} titleAs="p" />
        <div className="flex justify-end border-t pt-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/characters/${character.id}/edit`)}
          >
            <PenLine />
            {t("edit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
