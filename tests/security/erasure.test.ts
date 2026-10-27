import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { charactersErasedWithUser } from "@/lib/ownership";
import { ATTACKER, matches, OWNER } from "./ownership-fake";

const mine = { id: "s-mine", userId: OWNER };
const theirs = { id: "s-theirs", userId: ATTACKER };
const erased = (row: Record<string, unknown>) =>
  matches(row, charactersErasedWithUser(OWNER) as Record<string, unknown>);

describe("charactersErasedWithUser", () => {
  it("erases a character the departing user owns", () => {
    expect(erased({ userId: OWNER, scenario: [theirs] })).toBe(true);
  });

  it("erases an unowned legacy character linked only to the user's scenarios", () => {
    expect(erased({ userId: null, scenario: [mine, mine] })).toBe(true);
  });

  it("keeps an unowned character also linked to another user's scenario", () => {
    expect(erased({ userId: null, scenario: [mine, theirs] })).toBe(false);
  });

  it("keeps an unowned character linked to no scenario of the user", () => {
    expect(erased({ userId: null, scenario: [] })).toBe(false);
    expect(erased({ userId: null, scenario: [theirs] })).toBe(false);
  });

  it("keeps another user's owned character, even when linked to the user's scenario", () => {
    expect(erased({ userId: ATTACKER, scenario: [mine] })).toBe(false);
  });
});
