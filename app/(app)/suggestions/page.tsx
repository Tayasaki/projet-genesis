import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function Suggestion() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (user.role !== "ADMIN" && user.role !== "SUPERUSER") notFound();

  redirect("/manage?tab=suggestions");
}
