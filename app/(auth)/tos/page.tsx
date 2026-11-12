import { PageHeader } from "@/components/ui/page-header";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader title={t("title")} />
      {sections.map((section) => (
        <section
          key={section.heading}
          className="flex flex-col gap-3 text-sm leading-7"
        >
          <h2 className="text-lg font-semibold tracking-tight">
            {section.heading}
          </h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
