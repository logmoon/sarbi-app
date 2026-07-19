"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { READY_FADE_MS, type KdsOrder } from "@/hooks/use-kds-orders";

type OrderQueueCardProps = {
  order: KdsOrder;
  onStart: () => void;
  onMarkReady: () => void;
  onCancel: () => void;
  actionLoading: boolean;
};

type StatusBorder = "border-status-error" | "border-status-warning" | "border-status-success";

function getStatusBorder(status: KdsOrder["status"]): StatusBorder {
  switch (status) {
    case "pending":
    case "cancelled":
      return "border-status-error";
    case "in_progress":
      return "border-status-warning";
    default:
      return "border-status-success";
  }
}

function getStatusLabelClass(status: KdsOrder["status"]): string {
  switch (status) {
    case "pending":
    case "cancelled":
      return "text-status-error";
    case "in_progress":
      return "text-status-warning";
    default:
      return "text-status-success";
  }
}

function getStatusI18nKey(status: KdsOrder["status"]): string {
  return "kds.status." + status;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getElapsedSeconds(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
}

export function OrderQueueCard({
  order,
  onStart,
  onMarkReady,
  onCancel,
  actionLoading,
}: OrderQueueCardProps): React.ReactNode {
  const [elapsedSeconds, setElapsedSeconds] = useState(() => getElapsedSeconds(order.created_at));
  const { locale } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(getElapsedSeconds(order.created_at));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const elapsedMinutes = elapsedSeconds / 60;
  const timerClass =
    elapsedMinutes >= 15
      ? "text-status-error"
      : elapsedMinutes >= 10
        ? "text-status-warning"
        : "text-kds-text-secondary";

  const style = { border: getStatusBorder(order.status), labelClass: getStatusLabelClass(order.status) };
  const isReady = order.status === "ready";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border-2 bg-kds-surface p-4 text-kds-text",
        "transition-opacity ease-out motion-reduce:transition-none",
        style.border,
        isReady && "opacity-0"
      )}
      style={isReady ? { transitionDuration: `${READY_FADE_MS}ms` } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[32px] font-bold leading-none">
            {order.tables?.label ?? "—"}
          </div>
          {order.customer_name && (
            <div className="mt-1 text-sm text-kds-text-secondary">
              {order.customer_name}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn("text-xs font-semibold tracking-wide", style.labelClass)}>
            {t(locale, getStatusI18nKey(order.status))}
          </span>
          <span className={cn("font-mono text-lg font-semibold tabular-nums", timerClass)}>
            {formatElapsed(elapsedSeconds)}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 border-t border-kds-border-subtle pt-3">
        {order.order_items.map((item) => (
          <li key={item.id} className="text-xl leading-tight">
            <span className="font-semibold">{item.quantity}×</span> {item.item_name}
            {item.notes && (
              <div className="pl-6 text-sm text-kds-text-secondary">{item.notes}</div>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <div className="rounded-sm bg-kds-background px-3 py-2 text-sm text-kds-text-secondary">
          {order.notes}
        </div>
      )}

      {!isReady && (
        <div className="mt-1 flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={onCancel}
            disabled={actionLoading}
          >
            {t(locale, "common.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={order.status === "pending" ? onStart : onMarkReady}
            disabled={actionLoading}
          >
            {order.status === "pending" ? t(locale, "kds.startOrder") : t(locale, "kds.markReady")}
          </Button>
        </div>
      )}
    </div>
  );
}
