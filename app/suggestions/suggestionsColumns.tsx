"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { createAlignment } from "@/src/actions/character/alignment.action";
import { createCharacterSkill } from "@/src/actions/character/characterSkill.action";
import { createFortune } from "@/src/actions/character/fortune.action";
import { createStrength } from "@/src/actions/character/strength.action";
import { createTemperment } from "@/src/actions/character/temperment.action";
import { createWeakness } from "@/src/actions/character/weakness.action";
import { deleteSuggestion } from "@/src/actions/suggestion.action";
import { createAmmo } from "@/src/actions/weapon/ammo.action";
import { createDamage } from "@/src/actions/weapon/damage.action";
import { createRange } from "@/src/actions/weapon/range.action";
import { createWeaponSkill } from "@/src/actions/weapon/weaponSkill.action";
import { createWeight } from "@/src/actions/weapon/weight.action";
import { Suggestion } from "@/src/query/suggestion.query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export const columns: ColumnDef<Suggestion>[] = [
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
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              try {
                switch (row.original.type) {
                  case "Alignment":
                    createAlignment({
                      name: row.original.name,
                      description: row.original.description as
                        | string
                        | undefined,
                    });
                    break;
                  case "Ammo":
                    createAmmo({
                      name: row.original.name,
                    });
                    break;
                  case "CharacterSkill":
                    createCharacterSkill({ name: row.original.name });
                    break;
                  case "Damage":
                    createDamage({ name: row.original.name });
                    break;
                  case "Fortune":
                    createFortune({
                      name: row.original.name,
                      description: row.original.description as
                        | string
                        | undefined,
                    });
                    break;
                  case "Range":
                    createRange({ name: row.original.name });
                    break;
                  case "Strength":
                    createStrength({ name: row.original.name });
                    break;
                  case "Temperment":
                    createTemperment({
                      name: row.original.name,
                      description: row.original.description as
                        | string
                        | undefined,
                    });
                    break;
                  case "Weakness":
                    createWeakness({ name: row.original.name });
                    break;
                  case "WeaponSkill":
                    createWeaponSkill({ name: row.original.name });
                    break;
                  case "Weight":
                    createWeight({ name: row.original.name });
                    break;
                }
                deleteSuggestion({ name: row.original.name });
                toast.success("Suggestion acceptée");
              } catch (error) {
                toast.error("Erreur inconnu");
              }
            }}
          >
            Accepter
          </Button>
          <DeleteDialog
            item={row.original.name}
            deleteItem={() => deleteSuggestion({ name: row.original.name })}
          />
        </div>
      );
    },
  },
];
