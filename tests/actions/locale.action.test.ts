import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Locale } from "@/i18n/config";

const { set, cookies } = vi.hoisted(() => {
  const set = vi.fn();
  return { set, cookies: vi.fn(async () => ({ set })) };
});

vi.mock("next/headers", () => ({ cookies }));

beforeEach(() => {
  vi.clearAllMocks();
});

import { setLocale } from "@/src/actions/locale.action";

describe("setLocale", () => {
  // The signature rejects non-Locale input at compile time; the casts let the
  // runtime guard be exercised directly.
  it.each(["de", ""])(
    "rejects the unsupported locale %j and sets no cookie",
    async (locale) => {
      await expect(setLocale(locale as Locale)).rejects.toThrow(
        "Invalid locale",
      );

      expect(cookies).not.toHaveBeenCalled();
      expect(set).not.toHaveBeenCalled();
    },
  );

  it.each(["fr", "en"] as const)(
    "stores the %s locale in a one-year lax cookie",
    async (locale) => {
      await setLocale(locale);

      expect(set).toHaveBeenCalledTimes(1);
      expect(set).toHaveBeenCalledWith("locale", locale, {
        path: "/",
        maxAge: 31_536_000,
        sameSite: "lax",
      });
    },
  );
});
