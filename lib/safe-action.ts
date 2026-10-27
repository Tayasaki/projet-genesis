import { prisma } from "@/lib/prisma";
import { createSafeActionClient } from "next-safe-action";
import { getAuthSession } from "./auth";

export const action = createSafeActionClient();

class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

/**
 * Requires a logged-in user and exposes `ctx.userId`. That is all it
 * guarantees: any logged-in user passes, and nothing here scopes data to an
 * owner. Handlers must add the ownership predicate themselves, using the
 * predicates and assertions in `lib/ownership.ts`. See
 * documentation/reference/authorization-model.md.
 */
export const authenticatedAction = action.use(async ({ next }) => {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new ActionError("You must be logged in to perform this action");
  }
  return next({ ctx: { userId: session.user.id } });
});

/**
 * Requires a logged-in user whose `User.role` is ADMIN or SUPERUSER, checked
 * against the database on every call. Like `authenticatedAction`, it does not
 * scope data to an owner; use it for global reference data, not user-owned rows.
 */
export const authorizedAction = action.use(async ({ next }) => {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new ActionError("You must be logged in to perform this action");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: session.user.id,
    },
  });
  if (user.role !== "SUPERUSER" && user.role !== "ADMIN") {
    throw new ActionError("You are not authorized to perform this action");
  }
  return next({ ctx: { userId: session.user.id } });
});
