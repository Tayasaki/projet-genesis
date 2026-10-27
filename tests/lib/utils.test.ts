import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("supports conditional object and array syntax", () => {
    expect(cn({ active: true, hidden: false }, ["x", "y"])).toBe("active x y");
  });

  it("lets later Tailwind classes override conflicting earlier ones", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("keeps non-conflicting Tailwind classes", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("returns an empty string with no input", () => {
    expect(cn()).toBe("");
  });
});
