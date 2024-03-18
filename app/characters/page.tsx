import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
export default async function MyCharacters() {
  const session = await getAuthSession();
  if (!session) notFound();
  const characters = await prisma.character.findMany({
    where: {
      scneario: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });
  return <></>;
}
