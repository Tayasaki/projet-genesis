import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const ScenarioList = async () => {
  const session = await getAuthSession();
  const scenario = await prisma.scenario.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  return (
    <>
      <h1 className="text-lg font-bold">Scenario List</h1>

      {session?.user && (
        <div className="grid grid-cols-4 gap-4">
          {scenario.map((s, i) => (
            <Card key={s.id} className="max-w-xs flex-1">
              <CardHeader>
                <CardTitle>
                  <Link href={`/${s.id}`}>{s.name}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{s.description}</CardDescription>
              </CardContent>
              <CardFooter>{s.universe}</CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
