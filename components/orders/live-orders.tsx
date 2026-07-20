"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveOrders, type LiveOrder } from "@/hooks/use-live-orders";
import { formatItemPrice, timeAgo } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { translateCancelReason } from "@/lib/cancel-reason";

type LiveOrdersProps = {
  tenantId: string;
};

type StatusFilter = LiveOrder["status"] | null;

const FILTER_ITEMS: Array<{ value: StatusFilter; labelKey: string }> = [
  { value: null, labelKey: "orders.filterAll" },
  { value: "pending", labelKey: "order.status.pending" },
  { value: "in_progress", labelKey: "order.status.in_progress" },
  { value: "ready", labelKey: "order.status.ready" },
  { value: "cancelled", labelKey: "order.status.cancelled" },
  { value: "delivered", labelKey: "order.status.delivered" },
];

const STATUS_BORDER: Record<LiveOrder["status"], string> = {
  pending: "border-l-status-warning",
  in_progress: "border-l-status-info",
  ready: "border-l-status-success",
  delivered: "border-l-text-muted",
  cancelled: "border-l-status-error",
};

const STATUS_LABEL: Record<LiveOrder["status"], string> = {
  pending: "order.status.pending",
  in_progress: "order.status.in_progress",
  ready: "order.status.ready",
  delivered: "order.status.delivered",
  cancelled: "order.status.cancelled",
};

const STATUS_BADGE: Record<LiveOrder["status"], string> = {
  pending: "bg-status-warning/10 text-status-warning",
  in_progress: "bg-status-info/10 text-status-info",
  ready: "bg-status-success/10 text-status-success",
  delivered: "bg-text-muted/10 text-text-muted",
  cancelled: "bg-status-error/10 text-status-error",
};

const ACTIVE_STATUSES: ReadonlyArray<LiveOrder["status"]> = [
  "pending",
  "in_progress",
  "ready",
];

const RECENT_CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000;

function orderTotal(order: LiveOrder): number {
  return order.order_items.reduce(
    (sum, item) => sum + Number(item.subtotal ?? 0),
    0
  );
}

function matchesSearch(order: LiveOrder, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const tableLabel = order.tables?.label?.toLowerCase() ?? "";
  const customerName = order.customer_name?.toLowerCase() ?? "";
  return tableLabel.includes(q) || customerName.includes(q);
}

export function LiveOrders({ tenantId }: LiveOrdersProps) {
  const { locale } = useLanguage();
  const { orders, loading, error } = useLiveOrders(tenantId);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const hasFilters = statusFilter !== null || searchQuery.length > 0;

  const activeByLocation = useMemo(() => {
    const byLocation = new Map<
      string,
      { name: string; orders: LiveOrder[] }
    >();
    for (const order of orders) {
      if (statusFilter !== null && order.status !== statusFilter) continue;
      if (!ACTIVE_STATUSES.includes(order.status)) continue;
      if (!matchesSearch(order, searchQuery)) continue;
      const locId = order.location_id;
      const locName = order.locations?.name ?? "Location";
      if (!byLocation.has(locId)) {
        byLocation.set(locId, { name: locName, orders: [] });
      }
      byLocation.get(locId)!.orders.push(order);
    }
    const groups: Array<{ id: string; name: string; orders: LiveOrder[] }> = [];
    byLocation.forEach((group, id) => {
      group.orders.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      groups.push({ id, name: group.name, orders: group.orders });
    });
    return groups;
  }, [orders, statusFilter, searchQuery]);

  const recentCancellations = useMemo(() => {
    const cutoff = Date.now() - RECENT_CANCEL_WINDOW_MS;
    return orders
      .filter(
        (o) => {
          if (statusFilter !== null && o.status !== statusFilter) return false;
          if (!matchesSearch(o, searchQuery)) return false;
          return o.status === "cancelled" &&
            new Date(o.created_at).getTime() >= cutoff;
        }
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [orders, statusFilter, searchQuery]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          {t(locale, "orders.title")}
        </h1>
        <p className="text-sm text-text-secondary">
          {t(locale, "orders.subtitle")}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1 rounded-sm border border-border bg-surface p-0.5">
          {FILTER_ITEMS.map((item) => (
            <button
              key={item.value ?? "__all__"}
              onClick={() =>
                setStatusFilter(
                  statusFilter === item.value ? null : item.value
                )
              }
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === item.value
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              )}
            >
              {t(locale, item.labelKey)}
            </button>
          ))}
        </div>
        <div className="relative min-w-[180px] flex-1 sm:flex-none sm:w-56">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute top-1/2 start-3 -translate-y-1/2 text-text-muted pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(locale, "orders.searchPlaceholder")}
            className="w-full rounded-sm border border-border bg-surface py-2 ps-9 pe-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => {
              setStatusFilter(null);
              setSearchQuery("");
            }}
            className="rounded-sm px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary underline"
          >
            {t(locale, "orders.clearFilters")}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-sm border border-status-error bg-status-error/10 p-3 text-sm text-status-error">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-text-muted">{t(locale, "orders.loading")}</p>
        </div>
      ) : activeByLocation.length === 0 && recentCancellations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          {hasFilters ? (
            <>
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-lg font-medium text-text-primary">
                {t(locale, "orders.noResults")}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {t(locale, "orders.noResultsDesc")}
              </p>
            </>
          ) : (
            <>
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-lg font-medium text-text-primary">
                {t(locale, "orders.empty")}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {t(locale, "orders.emptyDesc")}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {activeByLocation.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                {t(locale, "orders.activeSection", {
                  count: activeByLocation.reduce(
                    (n, g) => n + g.orders.length,
                    0
                  ),
                })}
              </h2>
              <div className="space-y-6">
                {activeByLocation.map((group) => (
                  <div key={group.id}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {group.name}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.orders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {recentCancellations.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
                {t(locale, "orders.cancellationsSection", {
                  count: recentCancellations.length,
                })}
              </h2>
              <ul className="divide-y divide-border rounded-sm border border-border bg-surface">
                {recentCancellations.map((order) => (
                  <CancellationRow
                    key={order.id}
                    order={order}
                    locale={locale}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  locale,
}: {
  order: LiveOrder;
  locale: ReturnType<typeof useLanguage>["locale"];
}) {
  const total = orderTotal(order);
  const statusLabel = t(locale, STATUS_LABEL[order.status]);
  const badgeCls = STATUS_BADGE[order.status];
  const borderCls = STATUS_BORDER[order.status];

  return (
    <Card className={cn("border-l-4 transition-opacity", borderCls)}>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-text-primary">
              {order.tables?.label ?? t(locale, "orders.unknownTable")}
            </p>
            {order.customer_name && (
              <p className="text-xs text-text-secondary">
                {order.customer_name}
              </p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              badgeCls
            )}
          >
            {statusLabel}
          </span>
        </div>

        <ul className="mt-3 space-y-1">
          {order.order_items.map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-2 text-sm text-text-secondary"
            >
              <span className="min-w-0 truncate">
                <span className="text-text-primary">{item.quantity}×</span>{" "}
                {item.item_name}
                {item.notes && (
                  <span className="ms-1 text-xs italic text-text-muted">
                    ({item.notes})
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs">
                {formatItemPrice(Number(item.subtotal), locale)}
              </span>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="mt-2 rounded-sm bg-background p-2 text-xs italic text-text-secondary">
            {order.notes}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
          <span className="text-xs text-text-muted">
            {timeAgo(order.created_at, locale)}
          </span>
          <span className="text-sm font-semibold text-text-primary">
            {formatItemPrice(total, locale)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CancellationRow({
  order,
  locale,
}: {
  order: LiveOrder;
  locale: ReturnType<typeof useLanguage>["locale"];
}) {
  const tableLabel = order.tables?.label ?? t(locale, "orders.unknownTable");
  const reason = translateCancelReason(order.cancelled_reason, locale);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
      <span className="font-medium text-text-primary">{tableLabel}</span>
      {order.customer_name && (
        <span className="text-text-secondary">{order.customer_name}</span>
      )}
      <span className="rounded-full bg-status-error/10 px-2 py-0.5 text-xs font-medium text-status-error">
        {reason}
      </span>
      <span className="ms-auto text-xs text-text-muted">
        {timeAgo(order.created_at, locale)}
      </span>
    </li>
  );
}
