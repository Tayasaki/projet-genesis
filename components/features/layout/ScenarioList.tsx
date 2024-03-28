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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {scenario.map((s) => (
        <div key={s.id}>
          <Link href={`/${s.id}/characters`}>
            <Card className="max-w-md transition hover:scale-110 hover:ring-2 hover:ring-ring hover:ring-offset-2 active:scale-105">
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-wrap text-muted-foreground">
                  {s.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="font-semibold italic text-primary">
                {s.universe}
              </CardFooter>
            </Card>
          </Link>
        </div>
      ))}
    </div>
  );
};
