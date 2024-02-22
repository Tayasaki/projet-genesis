import { createSafeActionClient } from "next-safe-action";
import { getAuthSession } from "./auth";

export const action = createSafeActionClient();

class ActionError extends Error {}

export const authenticatedAction = createSafeActionClient({
  async middleware() {
    const session = await getAuthSession();
    if (!session?.user.id) {
      throw new ActionError("You must be logged in to perform this action");
    }

    return {
      userId: session.user.id,
    };
  },
});
