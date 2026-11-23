import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { ActionError } from "@/lib/safe-action";

const FOREIGN_KEY_VIOLATION = "P2003";

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
  try {
    await delegate.delete({ where: { name } });
  } catch (error) {
    // Weapon -> Damage/Weight/Range/Ammo is ON DELETE RESTRICT: an entry still
    // used by a weapon must not be deleted (it used to cascade to the weapons).
    if ((error as { code?: string })?.code === FOREIGN_KEY_VIOLATION) {
      const t = await getTranslations("manage");
      throw new ActionError(t("attributeInUse"));
    }
    throw error;
  }
  revalidatePath("/manage");
}
