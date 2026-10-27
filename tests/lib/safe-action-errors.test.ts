import { DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/auth", () => ({ getAuthSession: async () => null }));

import { action, ActionError } from "@/lib/safe-action";

describe("real safe-action client error handling", () => {
  it("passes an ActionError message through to the client", async () => {
    const res = await action.action(async () => {
      throw new ActionError("Too many suggestions, try again later");
    })();

    expect(res?.serverError).toBe("Too many suggestions, try again later");
  });

  it("masks any other error, including raw database messages", async () => {
    const res = await action.action(async () => {
      throw new Error('duplicate key value violates "Suggestion_pkey"');
    })();

    expect(res?.serverError).toBe(DEFAULT_SERVER_ERROR_MESSAGE);
  });
});
