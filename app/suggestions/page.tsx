import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSuggestions } from "@/src/query/suggestion.query";
import { notFound, redirect } from "next/navigation";
import { DataTable } from "../manage/data-table";
import { columns as suggestionsColumns } from "./suggestionsColumns";

export default async function Suggestion() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (user.role !== "ADMIN" && user.role !== "SUPERUSER") notFound();

  const suggestion = await getSuggestions();
  return (
    <DataTable
      data={suggestion}
      columns={suggestionsColumns}
      title="Suggestions"
    />
  );
}
