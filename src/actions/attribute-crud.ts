import { revalidatePath } from "next/cache";

type NameAttributeInput = { name: string; description?: string };

type NameAttributeDelegate = {
  create: (args: { data: NameAttributeInput }) => Promise<unknown>;
  delete: (args: { where: { name: string } }) => Promise<unknown>;
};

// Prisma call + revalidation for "name (+ optional description)" reference
// tables. Auth-agnostic: callers must wrap these in authorizedAction (each
// entity's `*.action.ts` owns its schema and auth).
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
