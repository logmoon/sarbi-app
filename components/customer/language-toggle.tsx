"use client";

import { type Locale } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

const labels: Record<Locale, string> = {
  ar: "العربية",
  fr: "Français",
  en: "English",
};

type LanguageToggleProps = {
  locale: Locale;
  onChange: (locale: Locale) => void;
};

export function LanguageToggle({ locale, onChange }: LanguageToggleProps) {
  const locales: Locale[] = ["ar", "fr", "en"];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            locale === l
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
