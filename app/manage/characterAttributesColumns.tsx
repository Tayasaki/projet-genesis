"use client";

import { Button } from "@/components/ui/button";
import { deleteAlignment } from "@/src/actions/character/alignment.action";
import { deleteCharacterSkill } from "@/src/actions/character/characterSkill.action";
import { deleteFortune } from "@/src/actions/character/fortune.action";
import { deleteStrength } from "@/src/actions/character/strength.action";
import { deleteTemperment } from "@/src/actions/character/temperment.action";
import { deleteWeakness } from "@/src/actions/character/weakness.action";
import { ColumnDef } from "@tanstack/react-table";
import { XSquare } from "lucide-react";
import { toast } from "sonner";
import { CharacterAttributes } from "./page";

export const columns: ColumnDef<CharacterAttributes>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const r = row.original;
      let type = "";
      switch (r.type) {
        case "temperment":
          type = "tempérament";
          break;
        case "alignement":
          type = "alignement";
          break;
        case "fortune":
          type = "fortune";
          break;
        case "strength":
          type = "force";
          break;
        case "weakness":
          type = "faiblesse";
          break;
        case "skill":
          type = "compétence";
          break;
      }
      return <span className="capitalize">{type}</span>;
    },
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
      return (
        <span className={!r.description ? "italic" : ""}>
          {r.description ?? "Pas de description"}
        </span>
      );
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
