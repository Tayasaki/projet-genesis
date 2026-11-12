import { getAuthSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function TOS() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const t = await getTranslations("tos");
  const sections = t.raw("sections") as {
    heading: string;
    body: string[];
  }[];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      {sections.map((section) => (
        <div key={section.heading} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
