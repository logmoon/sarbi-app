import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { t, type Locale } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

function intlLocale(locale?: Locale): string {
  switch (locale) {
    case "ar":
      return "ar-TN";
    default:
      return "fr-TN";
  }
}

export function formatPrice(amountInMillimes: number, locale?: Locale): string {
  if (!Number.isFinite(amountInMillimes)) {
    const fallback = locale === "ar" ? "0.000 د.ت" : "0.000 DT";
    return fallback;
  }
  const tnd = Math.max(0, amountInMillimes) / 1000;
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
  }).format(tnd);
}

export function formatItemPrice(price: number, locale?: Locale): string {
  if (!Number.isFinite(price)) {
    const fallback = locale === "ar" ? "0.000 د.ت" : "0.000 DT";
    return fallback;
  }
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
  }).format(price);
}

export function timeAgo(date: Date | string, locale: Locale = "en"): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 0) {
    const absSeconds = Math.abs(seconds);
    if (absSeconds < 60) return t(locale, "time.inAMoment");
    if (absSeconds < 3600) return t(locale, "time.inMinutes", { n: Math.floor(absSeconds / 60) });
    if (absSeconds < 86400) return t(locale, "time.inHours", { n: Math.floor(absSeconds / 3600) });
    return t(locale, "time.inDays", { n: Math.floor(absSeconds / 86400) });
  }
  if (seconds < 60) return t(locale, "time.justNow");
  if (seconds < 3600) return t(locale, "time.minutesAgo", { n: Math.floor(seconds / 60) });
  if (seconds < 86400) return t(locale, "time.hoursAgo", { n: Math.floor(seconds / 3600) });
  return t(locale, "time.daysAgo", { n: Math.floor(seconds / 86400) });
}
