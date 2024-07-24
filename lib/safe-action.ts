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

const handleReturnedError = (error: Error) => {
  if (error instanceof ActionError) {
    // Handle the error
    return error.message;
  }
  return "An unexpected error occurred";
};

export const authenticatedAction = createSafeActionClient({
  handleReturnedServerError: handleReturnedError,
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

export const authorizedAction = createSafeActionClient({
  handleReturnedServerError: handleReturnedError,
  async middleware() {
    const session = await getAuthSession();
    if (!session?.user.id) {
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
  },
});
