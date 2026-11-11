import { beforeEach, describe, expect, it, vi } from "vitest";

const suggestions = [{ id: "suggestion-1", content: "more weapons" }];

vi.mock("@/lib/prisma", () => ({
  prisma: { suggestion: { findMany: vi.fn(async () => suggestions) } },
}));
vi.mock("@prisma/client", () => ({ Prisma: {} }));

import { getSuggestions } from "@/src/query/suggestion.query";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSuggestions", () => {
  it("lists all suggestion rows", async () => {
    await expect(getSuggestions()).resolves.toEqual(suggestions);
  });
});
