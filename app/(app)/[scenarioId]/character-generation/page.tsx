import { redirect } from "next/navigation";

export default async function CharacterGenerationRedirect(props: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await props.params;
  redirect(`/characters/new?scenario=${encodeURIComponent(scenarioId)}`);
}
