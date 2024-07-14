import { getSuggestions } from "@/src/query/suggestion.query";
import { DataTable } from "../manage/data-table";
import { columns as suggestionsColumns } from "./suggestionsColumns";

export default async function Suggestion() {
  const suggestion = await getSuggestions();
  return (
    <DataTable
      data={suggestion}
      columns={suggestionsColumns}
      title="Suggestions"
    />
  );
}
