"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scenario } from "@prisma/client";
import Link from "next/link";
import { DeleteDialog } from "./DeleteDialog";
import { deleteScenario } from "@/src/actions/scenario.action";
import { toast } from "sonner";

export const ScenarioList = ({ scenario }: { scenario: Scenario[] }) => {
  if (scenario.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center">
        Aucun scénario. Créez-en un pour commencer.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scenario.map((s) => (
        <div key={s.id}>
          <Card className="transition">
            <CardHeader>
              <CardTitle>
                <Link
                  className="hover:text-primary"
                  href={`/${s.id}/characters`}
                >
                  {s.name}{" "}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground text-wrap">
                {s.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="text-primary justify-between font-semibold italic">
              {s.universe}
              <DeleteDialog
                item={s.name}
                deleteItem={async () => {
                  await deleteScenario({ id: s.id });
                  toast.success(`${s.name} supprimé`);
                }}
              />
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
};
