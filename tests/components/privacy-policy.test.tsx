import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  session: null as { user: { id: string } } | null,
}));

vi.mock("@/lib/auth", () => ({ getAuthSession: async () => h.session }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));

import PrivacyPolicy from "@/app/privacy-policy/page";

const text = async () => {
  const { container } = render(await PrivacyPolicy());
  return (container.textContent ?? "").replace(/\s+/g, " ");
};

describe("privacy policy", () => {
  beforeEach(() => {
    h.session = { user: { id: "u1" } };
  });

  it("redirects anonymous visitors to /login", async () => {
    h.session = null;
    await expect(PrivacyPolicy()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("no longer claims that OAuth tokens are encrypted", async () => {
    const content = await text();
    expect(content).not.toContain("méthodes de chiffrement avancées");
    expect(content).not.toMatch(
      /jetons d'accès OAuth, sont également protégées/,
    );
    expect(content).toContain(
      "ne font pas l'objet d'un chiffrement supplémentaire au niveau de l'application",
    );
  });

  it("states what is stored: tokens, sessions without IP/user agent, content", async () => {
    const content = await text();
    expect(content).toContain(
      "Les jetons d'accès et de rafraîchissement OAuth reçus du fournisseur, rattachés à votre compte",
    );
    expect(content).toContain(
      "L'adresse IP et le navigateur utilisé (user agent) ne sont pas enregistrés dans ces sessions",
    );
    expect(content).toContain("scénarios, personnages, armes et suggestions");
  });

  it("describes retention and deletion, with anonymous suggestions", async () => {
    const content = await text();
    expect(content).toContain("4. Conservation et suppression des données");
    expect(content).toContain(
      "Vous pouvez demander la suppression de votre compte",
    );
    expect(content).toContain("la référence à leur auteur est retirée");
    expect(content).toContain("5. Modifications de la politique");
  });
});
