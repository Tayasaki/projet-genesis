import { TabsManagement } from "@/src/features/management/TabsManagement";
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
  const ammo = await prisma.ammo.findMany();
  const damage = await prisma.damage.findMany();
  const range = await prisma.range.findMany();
  const weight = await prisma.weight.findMany();
  const weaponSkill = await prisma.weaponSkill.findMany();
  return (
    <div className="w-full">
      <div className="flex w-full flex-col divide-y-2 p-4">
        <div className="flex flex-row justify-between">
          {temperment.length > 0 && (
            <div className="container">
              <h1>Temperment</h1>
              <ul role="list">
                {temperment.map((t) => (
                  <li key={t.id}>{t.name}</li>
                ))}
              </ul>
            </div>
          )}
          {weakness.length > 0 && (
            <div className="container">
              <h1>Faiblesse</h1>
              <ul role="list">
                {weakness.map((w) => (
                  <li key={w.id}>{w.name}</li>
                ))}
              </ul>
            </div>
          )}
          {strength.length > 0 && (
            <div className="container">
              <h1>Force</h1>
              <ul role="list">
                {strength.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </div>
          )}
          {fortune.length > 0 && (
            <div className="container">
              <h1>Fortune</h1>
              <ul role="list">
                {fortune.map((f) => (
                  <li key={f.id}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}
          {alignment.length > 0 && (
            <div className="container">
              <h1>Alignement</h1>
              <ul role="list">
                {alignment.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
              </ul>
            </div>
          )}
          {characterSkill.length > 0 && (
            <div className="container">
              <h1>Compétence</h1>
              <ul role="list">
                {characterSkill.map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-row justify-between">
          {ammo.length > 0 && (
            <div className="container">
              <h1>Munition</h1>
              <ul role="list">
                {ammo.map((a) => (
                  <li key={a.id}>{a.name}</li>
                ))}
              </ul>
            </div>
          )}
          {damage.length > 0 && (
            <div className="container">
              <h1>Dégât</h1>
              <ul role="list">
                {damage.map((d) => (
                  <li key={d.id}>{d.name}</li>
                ))}
              </ul>
            </div>
          )}
          {range.length > 0 && (
            <div className="container">
              <h1>Portée</h1>
              <ul role="list">
                {range.map((r) => (
                  <li key={r.id}>{r.name}</li>
                ))}
              </ul>
            </div>
          )}
          {weight.length > 0 && (
            <div className="container">
              <h1>Poids</h1>
              <ul role="list">
                {weight.map((w) => (
                  <li key={w.id}>{w.name}</li>
                ))}
              </ul>
            </div>
          )}
          {weaponSkill.length > 0 && (
            <div className="container">
              <h1>Compétence Arme</h1>
              <ul role="list">
                {weaponSkill.map((w) => (
                  <li key={w.id}>{w.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <TabsManagement />
    </div>
  );
}
