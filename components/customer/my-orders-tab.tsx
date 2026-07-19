"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { formatItemPrice, timeAgo, cn } from "@/lib/utils";
import { type Locale, t } from "@/lib/i18n";
import type { Order } from "@/hooks/use-orders";

type StatusKey = "pending" | "in_progress" | "ready" | "delivered" | "cancelled";

function getStatusBorder(key: StatusKey): string {
  switch (key) {
    case "pending":
      return "border-l-status-error";
    case "in_progress":
      return "border-l-status-warning";
    case "ready":
      return "border-l-status-success";
    default:
      return "border-l-border";
  }
}

function getStatusBadge(key: StatusKey): string {
  switch (key) {
    case "pending":
      return "bg-status-error/10 text-status-error";
    case "in_progress":
      return "bg-status-warning/10 text-status-warning";
    case "ready":
      return "bg-status-success/10 text-status-success";
    default:
      return "bg-text-muted/10 text-text-muted";
  }
}

type MyOrdersTabProps = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  locale: Locale;
};

export function MyOrdersTab({ orders, loading, error, sessionId, locale }: MyOrdersTabProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!cancellingId || !sessionId) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${cancellingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          reason: cancelReason || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? t(locale, "order.failedToCancel"));
      }
      setCancellingId(null);
      setCancelReason("");
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : t(locale, "order.failedToCancel"));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <p className="text-lg font-semibold text-text-primary">
          {t(locale, "order.somethingWrong")}
        </p>
        <p className="text-sm text-text-secondary">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <p className="text-lg font-semibold text-text-primary">{t(locale, "order.noOrders")}</p>
        <p className="text-sm text-text-secondary">
          {t(locale, "order.noOrdersDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-4">
      {orders.map((order) => {
        const config = { border: getStatusBorder(order.status as StatusKey), badge: getStatusBadge(order.status as StatusKey) };
        const orderTotal = order.order_items.reduce(
          (sum: number, item) => sum + item.subtotal,
          0
        );

        return (
          <Card key={order.id} className={cn("border-l-4", config.border)}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    config.badge
                  )}
                >
                  {t(locale, "order.status." + order.status)}
                </span>
              </div>
              <span className="whitespace-nowrap text-xs text-text-muted">
                {timeAgo(order.created_at, locale)}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-text-primary">
                    {item.quantity}x {item.item_name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatItemPrice(item.item_price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
              <span className="text-xs text-text-secondary">{t(locale, "order.total")}</span>
              <span className="text-sm font-semibold text-text-primary">
                {formatItemPrice(orderTotal)}
              </span>
            </div>

            {order.status === "pending" && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  className="h-auto px-0 text-xs text-status-error hover:text-status-error"
                  onClick={() => setCancellingId(order.id)}
                >
                  {t(locale, "order.cancel")}
                </Button>
              </div>
            )}
          </Card>
        );
      })}

      <Dialog
        open={cancellingId !== null}
        onClose={() => {
          if (!cancelling) {
            setCancellingId(null);
            setCancelReason("");
            setCancelError(null);
          }
        }}
        title={t(locale, "order.cancelTitle")}
      >
        <p className="text-sm text-text-secondary">
          {t(locale, "order.cancelConfirm")}
        </p>
        <input
          type="text"
          placeholder={t(locale, "order.cancelReason")}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          maxLength={200}
          className="mt-3 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus"
        />
        {cancelError && (
          <p className="mt-2 text-xs text-status-error">{cancelError}</p>
        )}
        <DialogActions>
          <Button
            variant="secondary"
            onClick={() => {
              setCancellingId(null);
              setCancelReason("");
              setCancelError(null);
            }}
            disabled={cancelling}
          >
            {t(locale, "order.keepOrder")}
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? t(locale, "order.cancelling") : t(locale, "order.cancelTitle")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
