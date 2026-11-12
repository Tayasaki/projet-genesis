"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Scenario } from "@prisma/client";
import { BookOpen, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { DeleteDialog } from "./DeleteDialog";
import { deleteScenario } from "@/src/actions/scenario.action";
import { toast } from "sonner";

export type ScenarioWithCount = Scenario & { _count: { character: number } };

export const ScenarioList = ({
  scenario,
}: {
  scenario: ScenarioWithCount[];
}) => {
  const t = useTranslations("scenario");
  if (scenario.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={t("empty")}
        description={t("emptyDescription")}
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scenario.map((s) => (
        <Card
          key={s.id}
          className="hover:border-primary/40 focus-within:border-primary/40 relative gap-3 py-5 transition-colors"
        >
          <CardHeader className="gap-2">
            <Badge variant="secondary" className="w-fit">
              {s.universe}
            </Badge>
            <CardTitle className="text-base font-semibold">
              <Link
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                href={`/${s.id}/characters`}
              >
                {s.name}
              </Link>
            </CardTitle>
            {s.description && (
              <CardDescription className="line-clamp-2 text-sm">
                {s.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardFooter className="mt-auto items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Users className="size-4" />
              {t("characterCount", { count: s._count.character })}
            </span>
            <div className="relative z-10">
              <DeleteDialog
                item={s.name}
                deleteItem={async () => {
                  await deleteScenario({ id: s.id });
                  toast.success(t("deletedSuccess", { name: s.name }));
                }}
              />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
