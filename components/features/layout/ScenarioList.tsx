"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Scenario } from "@prisma/client";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { DeleteDialog } from "./DeleteDialog";
import { deleteScenario } from "@/src/actions/scenario.action";
import { toast } from "sonner";

export const ScenarioList = ({ scenario }: { scenario: Scenario[] }) => {
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
          className="hover:border-primary/40 flex flex-col justify-between gap-3 py-5 transition-colors"
        >
          <CardHeader className="gap-1.5">
            <CardTitle className="text-base font-semibold">
              <Link className="hover:text-primary" href={`/${s.id}/characters`}>
                {s.name}
              </Link>
            </CardTitle>
          </CardHeader>
          {s.description && (
            <CardContent>
              <CardDescription className="text-muted-foreground text-sm">
                {s.description}
              </CardDescription>
            </CardContent>
          )}
          <CardFooter className="items-center justify-between">
            <Badge variant="secondary">{s.universe}</Badge>
            <DeleteDialog
              item={s.name}
              deleteItem={async () => {
                await deleteScenario({ id: s.id });
                toast.success(t("deletedSuccess", { name: s.name }));
              }}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
