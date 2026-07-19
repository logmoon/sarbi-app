"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { timeAgo, formatItemPrice } from "@/lib/utils";

export type FeedItem =
  | {
      kind: "event";
      id: string;
      eventType: "waiter_called" | "bill_requested" | "check_needed";
      tableLabel: string;
      customerName: string | null;
      createdAt: string;
      runningTotal?: number;
    }
  | {
      kind: "order_ready";
      id: string;
      tableLabel: string;
      customerName: string | null;
      items: { name: string; qty: number }[];
      orderTotal: number;
      createdAt: string;
    }
  | {
      kind: "order_cancelled";
      id: string;
      tableLabel: string;
      customerName: string | null;
      cancelledReason: string | null;
      createdAt: string;
    };

type FeedCardProps = {
  item: FeedItem;
  actionLoading?: boolean;
  onResolve?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onConfirmDelivered?: (id: string) => void;
};

const STATUS_BORDER: Record<string, string> = {
  waiter_called: "border-l-status-info",
  bill_requested: "border-l-status-warning",
  check_needed: "border-l-border",
  order_ready: "border-l-status-success",
  order_cancelled: "border-l-status-error",
};

function eventCardLabel(
  eventType: "waiter_called" | "bill_requested" | "check_needed",
  locale: "ar" | "fr" | "en"
): string {
  switch (eventType) {
    case "waiter_called":
      return t(locale, "floor.card.waiterCalled");
    case "bill_requested":
      return t(locale, "floor.card.billRequested");
    case "check_needed":
      return t(locale, "floor.card.checkTable");
  }
}

function translateCancelReason(reason: string, locale: "ar" | "fr" | "en"): string {
  switch (reason) {
    case "out_of_stock":
      return t(locale, "kds.cancelReason.outOfStock");
    case "kitchen_error":
      return t(locale, "kds.cancelReason.kitchenError");
    case "other":
      return t(locale, "kds.cancelReason.other");
    default:
      return reason;
  }
}

export function FeedCard({
  item,
  actionLoading,
  onResolve,
  onAcknowledge,
  onConfirmDelivered,
}: FeedCardProps) {
  const { locale } = useLanguage();

  const borderClass =
    item.kind === "event"
      ? STATUS_BORDER[item.eventType] ?? "border-l-border"
      : item.kind === "order_ready"
        ? STATUS_BORDER.order_ready
        : STATUS_BORDER.order_cancelled;

  return (
    <Card
      className={cn(
        "flex flex-col gap-2 border-l-4 transition-opacity",
        borderClass
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {item.kind === "event" ? (
              <span className="text-sm font-semibold text-text-primary">
                {eventCardLabel(item.eventType, locale)}
              </span>
            ) : item.kind === "order_ready" ? (
              <span className="text-sm font-semibold text-status-success">
                {t(locale, "floor.card.orderReady")}
              </span>
            ) : (
              <span className="text-sm font-semibold text-status-error">
                {t(locale, "floor.card.orderCancelled")}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">
            {item.tableLabel}
            {item.customerName && ` — ${item.customerName}`}
          </p>
        </div>
        <span className="shrink-0 text-xs text-text-muted">
          {timeAgo(item.createdAt, locale)}
        </span>
      </div>

      {item.kind === "event" && item.eventType === "bill_requested" && item.runningTotal != null && (
        <p className="text-sm font-semibold text-accent">
          {t(locale, "floor.session.total")}:{" "}
          {formatItemPrice(item.runningTotal)}
        </p>
      )}

      {item.kind === "order_ready" && (
        <div className="text-sm text-text-secondary">
          {item.items.map((i, idx) => (
            <span key={idx}>
              {i.qty}x {i.name}
              {idx < item.items.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}

      {item.kind === "order_cancelled" && item.cancelledReason && (
        <p className="text-sm text-text-secondary">
          {translateCancelReason(item.cancelledReason, locale)}
        </p>
      )}

      <div className="mt-1 flex gap-2">
        {item.kind === "event" && onResolve && (
          <Button
            className="flex-1 text-xs"
            onClick={() => onResolve(item.id)}
            disabled={actionLoading}
          >
            {t(locale, "floor.card.resolve")}
          </Button>
        )}
        {item.kind === "event" && !onResolve && onAcknowledge && (
          <Button
            variant="secondary"
            className="flex-1 text-xs"
            onClick={() => onAcknowledge(item.id)}
          >
            {t(locale, "floor.card.acknowledge")}
          </Button>
        )}
        {item.kind === "order_ready" && onConfirmDelivered && (
          <Button
            className="flex-1 text-xs"
            onClick={() => onConfirmDelivered(item.id)}
            disabled={actionLoading}
          >
            {actionLoading
              ? t(locale, "floor.delivering")
              : t(locale, "floor.card.confirmDelivered")}
          </Button>
        )}
        {item.kind === "order_cancelled" && onAcknowledge && (
          <Button
            variant="secondary"
            className="flex-1 text-xs"
            onClick={() => onAcknowledge(item.id)}
          >
            {t(locale, "floor.card.acknowledge")}
          </Button>
        )}
      </div>
    </Card>
  );
}
