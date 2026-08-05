import { revalidatePath } from "next/cache";

type NameAttributeInput = { name: string; description?: string };

type NameAttributeDelegate = {
  create: (args: { data: NameAttributeInput }) => Promise<unknown>;
  delete: (args: { where: { name: string } }) => Promise<unknown>;
};

// Shared body for the 11 "name (+ optional description)" reference-table
// entities (alignment, temperment, fortune, strength, weakness,
// characterSkill, ammo, damage, range, weaponSkill, weight). Each entity's
// `*.action.ts` file still declares its own authorizedAction/schema pair —
// this only removes the duplicated Prisma call + revalidatePath body.
export async function createNameAttribute(
  delegate: NameAttributeDelegate,
  input: NameAttributeInput,
) {
  await delegate.create({ data: input });
  revalidatePath("/manage");
}

export async function deleteNameAttribute(
  delegate: NameAttributeDelegate,
  name: string,
) {
  await delegate.delete({ where: { name } });
  revalidatePath("/manage");
}
