import "@testing-library/jest-dom/vitest";
import { createTranslator } from "next-intl";
import { vi } from "vitest";
import frMessages from "./messages/fr.json";

// Tests render components directly without the app's NextIntlClientProvider
// (same lightweight pattern already used for ThemeProvider/Toaster/etc.), so
// useTranslations/getTranslations are mocked here to build a real translator
// from the actual fr.json messages — tests exercise real copy, not stubs.
function translatorFor(namespaceOrOptions?: string | { namespace?: string }) {
  const namespace =
    typeof namespaceOrOptions === "string"
      ? namespaceOrOptions
      : namespaceOrOptions?.namespace;
  return createTranslator({
    locale: "fr",
    messages: frMessages,
    namespace: namespace as never,
  });
}

vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return {
    ...actual,
    useTranslations: (namespace?: string) => translatorFor(namespace),
    useLocale: () => "fr",
  };
});

vi.mock("next-intl/server", () => ({
  getTranslations: async (
    namespaceOrOptions?: string | { namespace?: string },
  ) => translatorFor(namespaceOrOptions),
  getLocale: async () => "fr",
  getMessages: async () => frMessages,
}));
