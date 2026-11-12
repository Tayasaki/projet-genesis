"use client";

import { DeleteDialog } from "@/components/features/layout/DeleteDialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { deleteWeapon } from "@/src/actions/weapon/weapon.action";
import { Weapon } from "@/src/query/weapon.query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Swords } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

function useWeaponColumns(): ColumnDef<Weapon>[] {
  const t = useTranslations("common");
  const tManage = useTranslations("manage");

  return [
    {
      accessorKey: "name",
      header: t("name"),
    },
    {
      accessorKey: "melee",
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
        return row.original.melee ? <Swords /> : "🔫";
      },
    },
    {
      accessorKey: "description",
      header: t("description"),
      cell: ({ row }) => {
        return (
          <span className={!row.original.description ? "italic" : ""}>
            {row.original.description || t("noDescription")}
          </span>
        );
      },
    },
    {
      accessorKey: "damage.name",
      header: tManage("damage"),
    },
    {
      accessorKey: "range.name",
      header: tManage("range"),
    },
    {
      accessorKey: "weight.name",
      header: tManage("weight"),
    },
    {
      accessorKey: "ammo.name",
      header: tManage("ammo"),
      cell: ({ row }) => {
        return row.original.melee ? "N/A" : row.original.ammo?.name;
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }) => {
        return (
          <DeleteDialog
            item={row.original.name}
            deleteItem={async () => {
              await deleteWeapon({ id: row.original.id });
              toast.success(t("deletedSuccess", { name: row.original.name }));
            }}
          />
        );
      },
    },
  ];
}

export function WeaponsTable({
  data,
  title,
}: {
  data: Weapon[];
  title: string;
}) {
  const columns = useWeaponColumns();
  return <DataTable columns={columns} data={data} title={title} />;
}
