"use client";

import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

export default function DashboardPage() {
  const { locale } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-text-primary">
        {t(locale, "dashboard.welcome")}
      </h1>
      <p className="text-sm text-text-secondary">
        {t(locale, "dashboard.setup")}
      </p>
    </div>
  );
}
