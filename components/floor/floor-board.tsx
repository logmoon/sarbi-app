"use client";

import { useState, useCallback, useMemo } from "react";
import { useFloorEvents } from "@/hooks/use-floor-events";
import { useFloorOrders } from "@/hooks/use-floor-orders";
import { useFloorSessions } from "@/hooks/use-floor-sessions";
import { useFloorSound } from "@/hooks/use-floor-sound";
import { LiveFeed } from "@/components/floor/live-feed";
import { SessionTab } from "@/components/floor/session-tab";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type FloorBoardProps = {
  locationId: string;
  locationName: string;
};

type Tab = "feed" | "sessions";

function SoundOnIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export function FloorBoard({ locationId, locationName }: FloorBoardProps) {
  const { locale } = useLanguage();
  const [tab, setTab] = useState<Tab>("feed");
  const [feedClearTarget, setFeedClearTarget] = useState<{
    eventId: string;
    sessionId: string;
  } | null>(null);

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    resolveEvent,
  } = useFloorEvents(locationId);

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    confirmDelivered,
    acknowledgeCancelled,
  } = useFloorOrders(locationId);

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    clearTable,
  } = useFloorSessions(locationId);

  // Feed-relevant orders: ready + recently cancelled (last 30 min) that
  // haven't been acknowledged yet. Acknowledgment is persisted on the
  // order itself so it stays dismissed across refreshes and is shared
  // across every screen watching this location, not just the one that
  // acknowledged it.
  const feedOrders = useMemo(() => {
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    return orders.filter(
      (o) =>
        o.status === "ready" ||
        (o.status === "cancelled" &&
          !o.cancelled_acknowledged_at &&
          new Date(o.updated_at ?? o.created_at).getTime() > thirtyMinAgo)
    );
  }, [orders]);

  const feedItemCount = events.length + feedOrders.length;

  const { muted, toggleMute } = useFloorSound(feedItemCount);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleResolve = useCallback(
    async (eventId: string) => {
      setActionLoadingId(eventId);
      await resolveEvent(eventId);
      setActionLoadingId(null);
    },
    [resolveEvent]
  );

  const handleConfirmDelivered = useCallback(
    async (orderId: string) => {
      setActionLoadingId(orderId);
      await confirmDelivered(orderId);
      setActionLoadingId(null);
    },
    [confirmDelivered]
  );

  const handleAcknowledgeCancelled = useCallback(
    async (orderId: string) => {
      setActionLoadingId(orderId);
      await acknowledgeCancelled(orderId);
      setActionLoadingId(null);
    },
    [acknowledgeCancelled]
  );

  const handleFeedClearTableRequest = useCallback(
    (eventId: string, sessionId: string) => {
      setFeedClearTarget({ eventId, sessionId });
    },
    []
  );

  const handleFeedClearTableConfirm = useCallback(async () => {
    if (!feedClearTarget) return;
    const { eventId, sessionId } = feedClearTarget;
    setFeedClearTarget(null);
    setActionLoadingId(eventId);
    try {
      await clearTable(sessionId);
    } catch {
      // Session may already be closed — still resolve the event
    }
    await resolveEvent(eventId);
    setActionLoadingId(null);
  }, [feedClearTarget, clearTable, resolveEvent]);

  const combinedError = eventsError ?? ordersError ?? sessionsError;
  const combinedLoading = eventsLoading || ordersLoading || sessionsLoading;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-text-primary">
              {locationName}
            </h1>
            <p className="text-xs text-text-secondary">
              {t(locale, "floor.subtitle")}
            </p>
          </div>
          <button
            onClick={toggleMute}
            aria-label={
              muted ? t(locale, "floor.unmute") : t(locale, "floor.mute")
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:bg-surface"
          >
            {muted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
        </div>
      </header>

      <div className="shrink-0 border-b border-border bg-background">
        <div className="flex gap-1 px-4 py-2">
          <button
            onClick={() => setTab("feed")}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "feed"
                ? "bg-accent text-white"
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
            )}
          >
            {t(locale, "floor.tab.feed")}
          </button>
          <button
            onClick={() => setTab("sessions")}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              tab === "sessions"
                ? "bg-accent text-white"
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
            )}
          >
            {t(locale, "floor.tab.sessions")}
          </button>
        </div>
      </div>

      {combinedError && (
        <div className="mx-4 mt-3 shrink-0 rounded-sm border border-status-error bg-status-error/10 px-3 py-2 text-sm text-status-error">
          {combinedError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tab === "feed" ? (
          <LiveFeed
            events={events}
            feedOrders={feedOrders}
            actionLoadingId={actionLoadingId}
            onResolve={handleResolve}
            onClearTable={handleFeedClearTableRequest}
            onConfirmDelivered={handleConfirmDelivered}
            onAcknowledgeCancelled={handleAcknowledgeCancelled}
            loading={combinedLoading}
            error={combinedError}
          />
        ) : (
          <SessionTab
            sessions={sessions}
            loading={combinedLoading}
            error={combinedError}
            onClearTable={clearTable}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!feedClearTarget}
        title={t(locale, "table.clearTableTitle")}
        message={t(locale, "floor.feed.confirmClearDesc")}
        onConfirm={handleFeedClearTableConfirm}
        onClose={() => setFeedClearTarget(null)}
        variant="danger"
        confirmLabel={t(locale, "table.clearTable")}
        loadingLabel={t(locale, "table.clearing")}
        loading={feedClearTarget ? actionLoadingId === feedClearTarget.eventId : false}
      />
    </div>
  );
}
