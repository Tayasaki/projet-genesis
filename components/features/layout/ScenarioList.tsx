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

export const ScenarioList = ({ scenario }: { scenario: Scenario[] }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scenario.map((s) => (
        <div key={s.id}>
          <Card className="max-w-md transition">
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
              <CardDescription className="text-wrap text-muted-foreground">
                {s.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="justify-between font-semibold italic text-primary">
              {s.universe}
              <DeleteDialog
                item={s.name}
                deleteItem={async () => await deleteScenario({ id: s.id })}
              />
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
};
