import { beforeEach, describe, expect, it, vi } from "vitest";

type Role = "USER" | "ADMIN" | "SUPERUSER";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
  role: "USER" as string,
  prisma: {
    user: { findUniqueOrThrow: vi.fn() },
    suggestion: { create: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: h.prisma }));
vi.mock("@/lib/auth", () => ({ getAuthSession: async () => h.session }));
vi.mock("@prisma/client", () => ({
  SuggestionType: Object.fromEntries(
    [
      "Alignment",
      "Ammo",
      "CharacterSkill",
      "Damage",
      "Fortune",
      "Range",
      "Strength",
      "Temperment",
      "Weakness",
      "WeaponSkill",
      "Weight",
    ].map((k) => [k, k]),
  ),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));
vi.mock("@/src/query/suggestion.query", () => ({
  getSuggestions: async () => [],
}));
vi.mock("../../app/manage/data-table", () => ({ DataTable: () => null }));
vi.mock("../../app/suggestions/suggestionsColumns", () => ({ columns: [] }));

import SuggestionsPage from "@/app/suggestions/page";
import {
  createSuggestion,
  deleteSuggestion,
} from "@/src/actions/suggestion.action";

function actAs(role: Role | null) {
  h.session = role ? { user: { id: "u1" } } : null;
  h.role = role ?? "USER";
}

beforeEach(() => {
  vi.clearAllMocks();
  h.prisma.user.findUniqueOrThrow.mockImplementation(async () => ({
    id: "u1",
    role: h.role,
  }));
  actAs("USER");
});

describe("deleteSuggestion authorization", () => {
  it("rejects an unauthenticated caller and never deletes", async () => {
    actAs(null);

    const res = await deleteSuggestion({ name: "Arrow" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.suggestion.delete).not.toHaveBeenCalled();
  });

  it("rejects a plain USER and never deletes", async () => {
    const res = await deleteSuggestion({ name: "Arrow" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.suggestion.delete).not.toHaveBeenCalled();
  });

  it.each(["ADMIN", "SUPERUSER"] as const)("allows %s", async (role) => {
    actAs(role);

    const res = await deleteSuggestion({ name: "Arrow" });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.suggestion.delete).toHaveBeenCalledWith({
      where: { name: "Arrow" },
    });
  });
});

describe("createSuggestion stays open to any logged-in user", () => {
  it("lets a plain USER suggest", async () => {
    const res = await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(res?.serverError).toBeUndefined();
    expect(h.prisma.suggestion.create).toHaveBeenCalledTimes(1);
  });

  it("still rejects an unauthenticated caller", async () => {
    actAs(null);

    const res = await createSuggestion({ type: "Ammo", name: "Arrow" });

    expect(res?.serverError).toBeDefined();
    expect(h.prisma.suggestion.create).not.toHaveBeenCalled();
  });
});

describe("/suggestions page gate", () => {
  it("redirects an anonymous visitor to /login", async () => {
    actAs(null);

    await expect(SuggestionsPage()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("returns notFound for a plain USER", async () => {
    await expect(SuggestionsPage()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it.each(["ADMIN", "SUPERUSER"] as const)("renders for %s", async (role) => {
    actAs(role);

    await expect(SuggestionsPage()).resolves.toBeDefined();
  });
});
