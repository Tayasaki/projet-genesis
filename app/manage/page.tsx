import { TabsManagement } from "@/features/layout/management/TabsManagement";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Manage() {
  const session = await getAuthSession();
  if (!session?.user.id) redirect("/login");

  const temperment = await prisma.temperment.findMany();
  const weakness = await prisma.weakness.findMany();
  const strength = await prisma.strength.findMany();
  const fortune = await prisma.fortune.findMany();
  const alignment = await prisma.alignment.findMany();
  const characterSkill = await prisma.characterSkill.findMany();
  return (
    <div className="w-full">
      <div className="flex flex-col w-full p-4">
        <div className="flex flex-row justify-between">
          <ul role="list">
            {temperment.map((t) => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
          <ul role="list">
            {weakness.map((w) => (
              <li key={w.id}>{w.name}</li>
            ))}
          </ul>
          <ul role="list">
            {strength.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
          <ul role="list">
            {fortune.map((f) => (
              <li key={f.id}>{f.name}</li>
            ))}
          </ul>
          <ul role="list">
            {alignment.map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
          <ul role="list">
            {characterSkill.map((cs) => (
              <li key={cs.id}>{cs.name}</li>
            ))}
          </ul>
        </div>
      </div>
      <TabsManagement />
    </div>
  );
}
