"use client";

import { Button } from "@/components/ui/button";
import { deleteAlignment } from "@/src/actions/weapon/character/alignment.action";
import { deleteCharacterSkill } from "@/src/actions/weapon/character/characterSkill.action";
import { deleteFortune } from "@/src/actions/weapon/character/fortune.action";
import { deleteStrength } from "@/src/actions/weapon/character/strength.action";
import { deleteTemperment } from "@/src/actions/weapon/character/temperment.action";
import { deleteWeakness } from "@/src/actions/weapon/character/weakness.action";
import { ColumnDef } from "@tanstack/react-table";
import { XSquare } from "lucide-react";
import { toast } from "sonner";
import { CharacterAttributes } from "./page";

export const columns: ColumnDef<CharacterAttributes>[] = [
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const r = row.original;
      return <span>{r.description ?? "Pas de description"}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <Button
          onClick={async () => {
            switch (r.type) {
              case "temperment":
                await deleteTemperment({ name: r.name });
                break;
              case "alignement":
                await deleteAlignment({ name: r.name });
                break;
              case "fortune":
                await deleteFortune({ name: r.name });
                break;
              case "strength":
                await deleteStrength({ name: r.name });
                break;
              case "weakness":
                await deleteWeakness({ name: r.name });
                break;
              case "skill":
                await deleteCharacterSkill({ name: r.name });
                break;
            }
            toast.success("Supprimé");
          }}
          variant={"destructive"}
        >
          <XSquare />
        </Button>
      );
    },
  },
];
