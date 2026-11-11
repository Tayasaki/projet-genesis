"use server";

import { isLocale, type Locale } from "@/i18n/config";
import { cookies } from "next/headers";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) throw new Error("Invalid locale");
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
