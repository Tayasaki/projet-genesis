"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { hasActionError } from "@/lib/action-result";
import { deleteAmmo } from "@/src/actions/weapon/ammo.action";
import { deleteDamage } from "@/src/actions/weapon/damage.action";
import { deleteRange } from "@/src/actions/weapon/range.action";
import { deleteWeaponSkill } from "@/src/actions/weapon/weaponSkill.action";
import { deleteWeight } from "@/src/actions/weapon/weight.action";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CharacterAttributes } from "./page";

// One entry per attribute type, holding both its translation key and delete action.
const WEAPON_ATTRIBUTE_CONFIG: Record<
  string,
  {
    labelKey: "ammo" | "damage" | "range" | "weight" | "skill";
    delete: (name: string) => Promise<{ serverError?: unknown } | void>;
  }
> = {
  ammo: { labelKey: "ammo", delete: (name) => deleteAmmo({ name }) },
  damage: { labelKey: "damage", delete: (name) => deleteDamage({ name }) },
  range: { labelKey: "range", delete: (name) => deleteRange({ name }) },
  weight: { labelKey: "weight", delete: (name) => deleteWeight({ name }) },
  skill: { labelKey: "skill", delete: (name) => deleteWeaponSkill({ name }) },
};

function useWeaponAttributesColumns(): ColumnDef<CharacterAttributes>[] {
  const t = useTranslations("common");
  const tManage = useTranslations("manage");

  return [
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("type")} <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const labelKey = WEAPON_ATTRIBUTE_CONFIG[row.original.type]?.labelKey;
        return <span className="capitalize">{labelKey ? tManage(labelKey) : ""}</span>;
      },
    },
    {
      accessorKey: "name",
      header: t("name"),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <DeleteDialog
            item={row.original.name}
            deleteItem={async () => {
              const value = await WEAPON_ATTRIBUTE_CONFIG[r.type]?.delete(r.name);
              if (hasActionError(value)) {
                toast.error(t("notAuthorizedDeleteAttribute"));
              }
            }}
          />
        );
      },
    },
  ];
}

export function WeaponAttributesTable({
  data,
  title,
}: {
  data: CharacterAttributes[];
  title: string;
}) {
  const columns = useWeaponAttributesColumns();
  return <DataTable columns={columns} data={data} title={title} />;
}
