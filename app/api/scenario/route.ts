import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Scenario = {
  name: string;
  universe: string;
  description?: string;
};

export const dynamic = "force-dynamic"; // defaults to auto
export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as Scenario;
  await prisma.scenario.create({
    data: {
      name: body.name,
      universe: body.universe,
      description: body.description,
      userId: session.user.id,
    },
  });
  return new Response("Scenario created", { status: 201 });
}
