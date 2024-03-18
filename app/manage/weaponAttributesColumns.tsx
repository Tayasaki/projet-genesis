"use client";

import { Button } from "@/components/ui/button";
import { deleteAmmo } from "@/src/actions/weapon/ammo.action";
import { deleteDamage } from "@/src/actions/weapon/damage.action";
import { deleteRange } from "@/src/actions/weapon/range.action";
import { deleteWeaponSkill } from "@/src/actions/weapon/weaponSkill.action";
import { deleteWeight } from "@/src/actions/weapon/weight.action";
import { ColumnDef } from "@tanstack/react-table";
import { XSquare } from "lucide-react";
import { toast } from "sonner";
import { CharacterAttributes } from "./page";
import { DeleteDialog } from "@/components/features/layout/DeleteDialog";

export const columns: ColumnDef<CharacterAttributes>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const r = row.original;
      let type = "";
      switch (r.type) {
        case "ammo":
          type = "munitions";
          break;
        case "damage":
          type = "dégâts";
          break;
        case "range":
          type = "portée";
          break;
        case "weight":
          type = "poids";
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <DeleteDialog
          item={row.original.name}
          deleteItem={async () => {
            switch (r.type) {
              case "ammo":
                await deleteAmmo({ name: r.name });
                break;
              case "damage":
                await deleteDamage({ name: r.name });
                break;
              case "range":
                await deleteRange({ name: r.name });
                break;
              case "weight":
                await deleteWeight({ name: r.name });
                break;
              case "skill":
                await deleteWeaponSkill({ name: r.name });
                break;
            }
          }}
        />
      );
    },
  },
];
