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
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      {sections.map((section) => (
        <div key={section.heading} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.list1 && (
            <ul role="list">
              {section.list1.map((item) => (
                <li key={item} className="before:mr-2 before:ml-6 before:content-['•']">
                  {item}
                </li>
              ))}
            </ul>
          )}
          {section.body2?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.list2 && (
            <ul role="list">
              {section.list2.map((item) => (
                <li key={item} className="before:mr-2 before:ml-6 before:content-['•']">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
