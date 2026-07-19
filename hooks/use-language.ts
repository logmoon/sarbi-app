"use client";

import { useContext } from "react";
import { LocaleContext } from "@/components/layout/locale-provider";
import { type Locale } from "@/lib/i18n";

export type { Locale };

export function useLanguage() {
  const ctx = useContext(LocaleContext);

  if (!ctx) {
    return {
      locale: "fr" as Locale,
      changeLocale: () => {},
    } as const;
  }

  return ctx;
}
