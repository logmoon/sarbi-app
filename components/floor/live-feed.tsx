"use client";

import { useMemo } from "react";
import { FeedCard, type FeedItem } from "@/components/floor/feed-card";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import type { FloorEvent } from "@/hooks/use-floor-events";
import type { FloorOrder } from "@/hooks/use-floor-orders";

type LiveFeedProps = {
  events: FloorEvent[];
  feedOrders: FloorOrder[];
  dismissedOrderIds: Set<string>;
  actionLoadingId: string | null;
  onResolve: (eventId: string) => void;
  onClearTable: (eventId: string, sessionId: string) => void;
  onConfirmDelivered: (orderId: string) => void;
  onAcknowledgeCancelled: (orderId: string) => void;
  loading: boolean;
  error: string | null;
};

function buildFeedItems(
  events: FloorEvent[],
  feedOrders: FloorOrder[],
  dismissedOrderIds: Set<string>
): FeedItem[] {
  const eventItems: FeedItem[] = events.map((ev): FeedItem => {
    const runningTotal =
      ev.type === "bill_requested" && ev.metadata?.running_total != null
        ? (ev.metadata.running_total as number)
        : undefined;
    return {
      kind: "event",
      id: ev.id,
      eventType: ev.type,
      tableLabel: ev.tables?.label ?? "",
      customerName: ev.sessions?.customer_name ?? null,
      createdAt: ev.created_at,
      runningTotal,
      clearTableSessionId: ev.type === "session_conflict" ? ev.session_id : undefined,
    };
  });

  const orderItems: FeedItem[] = feedOrders
    .filter((o) => !dismissedOrderIds.has(o.id))
    .flatMap((o): FeedItem[] => {
      const items: FeedItem[] = [];
      if (o.status === "ready") {
        items.push({
          kind: "order_ready",
          id: o.id,
          tableLabel: o.tables?.label ?? "",
          customerName: o.customer_name ?? null,
          items: (o.order_items ?? []).map((oi) => ({
            name: oi.item_name,
            qty: oi.quantity,
          })),
          orderTotal: (o.order_items ?? []).reduce(
            (sum, oi) => sum + (oi.subtotal ?? 0),
            0
          ),
          createdAt: o.created_at,
        });
      }
      if (o.status === "cancelled") {
        items.push({
          kind: "order_cancelled",
          id: o.id,
          tableLabel: o.tables?.label ?? "",
          customerName: o.customer_name ?? null,
          cancelledReason: o.cancelled_reason ?? null,
          createdAt: o.created_at,
        });
      }
      return items;
    });

  const all = [...eventItems, ...orderItems];
  all.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return all;
}

export function LiveFeed({
  events,
  feedOrders,
  dismissedOrderIds,
  actionLoadingId,
  onResolve,
  onClearTable,
  onConfirmDelivered,
  onAcknowledgeCancelled,
  loading,
  error,
}: LiveFeedProps) {
  const { locale } = useLanguage();

  const feedItems = useMemo(
    () => buildFeedItems(events, feedOrders, dismissedOrderIds),
    [events, feedOrders, dismissedOrderIds]
  );

  if (loading && feedItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-text-muted">{t(locale, "common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <p className="text-sm text-status-error">{error}</p>
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-2 text-text-muted"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <p className="text-lg font-medium text-text-primary">
          {t(locale, "floor.feed.empty")}
        </p>
        <p className="text-sm text-text-secondary">
          {t(locale, "floor.feed.emptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {feedItems.map((item) => (
        <FeedCard
          key={item.kind === "event" ? `event-${item.id}` : `order-${item.id}`}
          item={item}
          actionLoading={actionLoadingId === item.id}
          onResolve={
            item.kind === "event" && item.eventType !== "session_conflict"
              ? () => onResolve(item.id)
              : undefined
          }
          onAcknowledge={
            item.kind === "event" && item.eventType === "session_conflict"
              ? undefined
              : item.kind === "order_cancelled"
                ? () => onAcknowledgeCancelled(item.id)
                : undefined
          }
          onClearTable={
            item.kind === "event" && item.eventType === "session_conflict"
              ? onClearTable
              : undefined
          }
          onConfirmDelivered={
            item.kind === "order_ready"
              ? () => onConfirmDelivered(item.id)
              : undefined
          }
        />
      ))}
    </div>
  );
}
