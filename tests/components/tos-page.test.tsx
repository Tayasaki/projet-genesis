import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  getAuthSession: vi.fn(async () => null),
}));

vi.mock("@/lib/auth", () => ({ getAuthSession: h.getAuthSession }));

import TOS from "@/app/(auth)/tos/page";

describe("terms of service page", () => {
  it("renders for an anonymous visitor without reading the session", async () => {
    const { container } = render(await TOS());
    const content = (container.textContent ?? "").replace(/\s+/g, " ");

    expect(content).toContain(
      "Conditions générales d'utilisation de Projet-Genesis",
    );
    expect(content).toContain("1. Introduction");
    expect(h.getAuthSession).not.toHaveBeenCalled();
  });
});
