import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
}));

vi.mock("@/lib/auth", () => ({ getAuthSession: async () => h.session }));
vi.mock("@/lib/auth-client", () => ({ signIn: { social: vi.fn() } }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));

import Login from "@/app/(auth)/login/page";

describe("login consent notice", () => {
  beforeEach(() => {
    h.session = null;
  });

  it("tells anonymous visitors that signing in accepts the legal terms", async () => {
    const { container } = render(await Login());

    expect((container.textContent ?? "").replace(/\s+/g, " ")).toContain(
      "En vous connectant, vous acceptez les CGU et la politique de confidentialité.",
    );
  });

  it("links to the terms and the privacy policy in the same tab", async () => {
    render(await Login());

    const tos = screen.getByRole("link", { name: "CGU" });
    const privacy = screen.getByRole("link", {
      name: "politique de confidentialité",
    });
    expect(tos).toHaveAttribute("href", "/tos");
    expect(privacy).toHaveAttribute("href", "/privacy-policy");
    expect(tos).not.toHaveAttribute("target");
    expect(privacy).not.toHaveAttribute("target");
  });

  it("places the notice after the three provider buttons", async () => {
    render(await Login());

    const notice = screen.getByRole("link", { name: "CGU" }).closest("p")!;
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    for (const button of buttons) {
      expect(
        button.compareDocumentPosition(notice) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("still redirects signed-in users to /", async () => {
    h.session = { user: { id: "u1" } };
    await expect(Login()).rejects.toThrow("NEXT_REDIRECT:/");
  });
});
