import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const ScenarioList = async () => {
  const session = await getAuthSession();
  const scenario = await prisma.scenario.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  return (
    <div>
      <h1>Scenario List</h1>
      {session?.user && (
        <ul role="list">
          {scenario.map((scenario) => (
            <li key={scenario.id}>{scenario.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
