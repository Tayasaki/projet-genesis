import { prisma } from "@/lib/prisma";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { getTranslations } from "next-intl/server";
import { getAuthSession } from "./auth";

/**
 * The only error whose message reaches clients (see `handleServerError`), so
 * its message must be a static, user-safe string: never interpolate a caught
 * error's message or any data.
 */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

/**
 * Returns `ActionError` messages to the client; any other error is masked with
 * `DEFAULT_SERVER_ERROR_MESSAGE` so internal details never leak.
 */
export const action = createSafeActionClient({
  handleServerError: (error) =>
    error instanceof ActionError ? error.message : DEFAULT_SERVER_ERROR_MESSAGE,
});

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
    const t = await getTranslations("safeAction");
    throw new ActionError(t("mustBeLoggedIn"));
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
  const t = await getTranslations("safeAction");
  if (!session?.user?.id) {
    throw new ActionError(t("mustBeLoggedIn"));
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: session.user.id,
    },
  });
  if (user.role !== "SUPERUSER" && user.role !== "ADMIN") {
    throw new ActionError(t("notAuthorized"));
  }
  return next({ ctx: { userId: session.user.id } });
});
