import { PageHeader } from "@/components/ui/page-header";
import { getAuthSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function PrivacyPolicy() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/login");
  const t = await getTranslations("privacyPolicy");
  const sections = t.raw("sections") as {
    heading: string;
    body: string[];
    list1?: string[];
    body2?: string[];
    list2?: string[];
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
          {section.list1 && (
            <ul role="list">
              {section.list1.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground before:mr-2 before:ml-4 before:content-['•']"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
          {section.body2?.map((paragraph) => (
            <p key={paragraph} className="text-muted-foreground">
              {paragraph}
            </p>
          ))}
          {section.list2 && (
            <ul role="list">
              {section.list2.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground before:mr-2 before:ml-4 before:content-['•']"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
