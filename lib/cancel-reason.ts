import { t, type Locale } from "@/lib/i18n";

export const CANCEL_REASON_CODES = [
  "out_of_stock",
  "kitchen_error",
  "other",
] as const;

export type CancelReasonCode = (typeof CANCEL_REASON_CODES)[number];

export function isCancelReasonCode(value: string): value is CancelReasonCode {
  return (CANCEL_REASON_CODES as readonly string[]).includes(value);
}

const REASON_KEY: Record<CancelReasonCode, string> = {
  out_of_stock: "kds.cancelReason.outOfStock",
  kitchen_error: "kds.cancelReason.kitchenError",
  other: "kds.cancelReason.other",
};

// Translates a stored `orders.cancelled_reason` value for display. The
// orders table stores the raw KDS reason code (`out_of_stock`,
// `kitchen_error`, `other`) OR a free-form note that the kitchen typed
// when picking "other" + reason_note — that note was already typed in
// the caller's language at submission time, so we pass it through as-is.
//
// This is the single source of truth for cancel-reason display — both
// the floor live feed and the dashboard Live Orders view call this. The
// earlier per-component copy (feed-card.tsx#translateCancelReason) has
// been removed in favor of this shared helper.
export function translateCancelReason(
  reason: string | null | undefined,
  locale: Locale
): string {
  if (!reason) return "";
  if (isCancelReasonCode(reason)) {
    return t(locale, REASON_KEY[reason]);
  }
  return reason;
}
