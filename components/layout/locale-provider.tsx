"use client";

import { createContext, useState, useCallback, useEffect } from "react";
import { type Locale } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "sarbi-locale";

function getStoredLocale(): Locale | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ar" || stored === "fr" || stored === "en") return stored;
  return null;
}

function setCookie(locale: Locale) {
  document.cookie = `sarbi-locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored && stored !== initialLocale) {
      setLocale(stored);
    }
  }, [initialLocale]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const value = e.newValue;
      if (value === "ar" || value === "fr" || value === "en") {
        setLocale(value);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    setCookie(newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
