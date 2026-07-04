import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(amountInMillimes: number): string {
  if (!Number.isFinite(amountInMillimes)) return "0.000 TND";
  const tnd = Math.max(0, amountInMillimes) / 1000;
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
  }).format(tnd);
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 0) {
    const absSeconds = Math.abs(seconds);
    if (absSeconds < 60) return "in a moment";
    if (absSeconds < 3600) return `in ${Math.floor(absSeconds / 60)}m`;
    if (absSeconds < 86400) return `in ${Math.floor(absSeconds / 3600)}h`;
    return `in ${Math.floor(absSeconds / 86400)}d`;
  }
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
