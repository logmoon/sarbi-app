"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { formatItemPrice } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import type { FloorSession } from "@/hooks/use-floor-sessions";

type SessionTabProps = {
  sessions: FloorSession[];
  loading: boolean;
  error: string | null;
  onClearTable: (sessionId: string) => Promise<void>;
};

function formatElapsed(startedAt: string): string {
  const diff = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hrs}h ${remaining}m`;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-status-error/10 text-status-error",
  in_progress: "bg-status-warning/10 text-status-warning",
  ready: "bg-status-success/10 text-status-success",
  delivered: "bg-text-muted/10 text-text-muted",
  cancelled: "bg-text-muted/10 text-text-muted line-through",
};

export function SessionTab({
  sessions,
  loading,
  error,
  onClearTable,
}: SessionTabProps) {
  const { locale } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clearTarget, setClearTarget] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!clearTarget) return;
    setClearing(true);
    try {
      await onClearTable(clearTarget);
    } finally {
      setClearing(false);
      setClearTarget(null);
    }
  };

  if (loading) {
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

  if (sessions.length === 0) {
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
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
        <p className="text-lg font-medium text-text-primary">
          {t(locale, "floor.sessions.empty")}
        </p>
        <p className="text-sm text-text-secondary">
          {t(locale, "floor.sessions.emptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => {
        const isExpanded = expandedId === session.id;
        return (
          <Card key={session.id} className="flex flex-col gap-3">
            <button
              className="flex items-center justify-between text-left"
              onClick={() => setExpandedId(isExpanded ? null : session.id)}
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  {session.tables?.label ?? session.table_id.slice(0, 8)}
                </h3>
                <p className="text-xs text-text-secondary">
                  {session.customer_name ?? t(locale, "floor.session.guest")}{" "}
                  — {formatElapsed(session.started_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-accent">
                  {formatItemPrice(session.total)}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "shrink-0 text-text-muted transition-transform",
                    isExpanded && "rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border pt-3">
                {session.orders.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    {t(locale, "floor.session.noOrders")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {session.orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-sm border border-border bg-background p-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              STATUS_BADGE[order.status] ??
                                "bg-text-muted/10 text-text-muted"
                            )}
                          >
                            {t(locale, `order.status.${order.status}`)}
                          </span>
                          <span className="text-xs font-semibold text-text-primary">
                            {formatItemPrice(
                              (order.order_items ?? []).reduce(
                                (sum, oi) => sum + (oi.subtotal ?? 0),
                                0
                              )
                            )}
                          </span>
                        </div>
                        {(order.order_items ?? []).length > 0 && (
                          <div className="mt-1 text-xs text-text-secondary">
                            {(order.order_items ?? []).map((oi, i) => (
                              <span key={oi.id}>
                                {oi.quantity}x {oi.item_name}
                                {i < (order.order_items ?? []).length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 border-t border-border pt-3">
                  <Button
                    variant="danger"
                    className="w-full text-xs"
                    onClick={() => setClearTarget(session.id)}
                  >
                    {t(locale, "table.clearTable")}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <ConfirmDialog
        open={clearTarget !== null}
        onClose={() => setClearTarget(null)}
        onConfirm={handleClear}
        title={t(locale, "table.clearTableTitle")}
        message={t(locale, "table.clearTableConfirm", {
          label:
            sessions.find((s) => s.id === clearTarget)?.tables?.label ?? "",
        })}
        confirmLabel={t(locale, "table.clearTableTitle")}
        loadingLabel={t(locale, "table.clearing")}
        variant="danger"
        loading={clearing}
      />
    </div>
  );
}
