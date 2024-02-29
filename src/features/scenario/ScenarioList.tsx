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
          {scenario.map((s) => (
            <Link key={s.id} href={`/${s.id}`}>
              <Card className="max-w-md flex-1 hover:bg-gray-200 dark:hover:bg-gray-800">
                <CardHeader>
                  <CardTitle>{s.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{s.description}</CardDescription>
                </CardContent>
                <CardFooter>{s.universe}</CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
