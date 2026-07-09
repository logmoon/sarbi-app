"use client";

import { useState, useCallback, useEffect } from "react";

export type Locale = "ar" | "fr" | "en";

const STORAGE_KEY = "sarbi-locale";

function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "fr";
  const lang = navigator.language?.slice(0, 2);
  if (lang === "ar") return "ar";
  if (lang === "fr") return "fr";
  return "en";
}

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ar" || stored === "fr" || stored === "en") return stored;
  return null;
}

export function useLanguage() {
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    setLocale(getStoredLocale() ?? getBrowserLocale());
  }, []);

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return { locale, changeLocale };
}
