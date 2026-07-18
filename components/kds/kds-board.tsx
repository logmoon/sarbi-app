"use client";

import { useCallback, useState } from "react";
import { useKdsOrders, type KdsOrder } from "@/hooks/use-kds-orders";
import { useKdsSound } from "@/hooks/use-kds-sound";
import { OrderQueueCard } from "@/components/kds/order-queue-card";
import { CancelOrderModal } from "@/components/kds/cancel-order-modal";
import type { CancelReasonCode } from "@/lib/validators";

type KdsBoardProps = {
  locationId: string;
  locationName: string;
};

function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export function KdsBoard({ locationId, locationName }: KdsBoardProps): React.ReactNode {
  const { orders, loading, error, pendingCount, refetch } = useKdsOrders(locationId);
  const { muted, toggleMute } = useKdsSound(pendingCount);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<KdsOrder | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const updateStatus = useCallback(async (orderId: string, body: Record<string, unknown>) => {
    setActionLoadingId(orderId);
    setActionError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setActionError(json?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setActionError("Network error — please try again.");
    } finally {
      setActionLoadingId(null);
    }
  }, []);

  const handleCancelConfirm = useCallback(
    async (reasonCode: CancelReasonCode, reasonNote?: string) => {
      if (!cancelTarget) return;
      await updateStatus(cancelTarget.id, {
        status: "cancelled",
        reason_code: reasonCode,
        reason_note: reasonNote,
      });
      setCancelTarget(null);
    },
    [cancelTarget, updateStatus]
  );

  return (
    <div className="min-h-screen bg-kds-background px-6 py-5 text-kds-text">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{locationName}</h1>
          <p className="text-sm text-kds-text-secondary">
            {orders.length} order{orders.length === 1 ? "" : "s"} in queue
          </p>
        </div>
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute kitchen alerts" : "Mute kitchen alerts"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-kds-border-subtle text-kds-text-secondary transition-colors hover:bg-kds-surface"
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
      </header>

      {actionError && (
        <div className="mb-4 rounded-md border border-status-error bg-status-error/10 px-4 py-2 text-sm text-status-error">
          {actionError}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-status-error bg-status-error/10 px-4 py-2 text-sm text-status-error">
          <span>{error}</span>
          <button onClick={refetch} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {loading && orders.length === 0 && (
        <p className="text-kds-text-secondary">Loading orders…</p>
      )}

      {!loading && orders.length === 0 && !error && (
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
            className="mb-2 text-kds-text-secondary"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <p className="text-lg font-medium">All caught up</p>
          <p className="text-sm text-kds-text-secondary">
            New orders will appear here the moment they come in.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orders.map((order) => (
          <OrderQueueCard
            key={order.id}
            order={order}
            actionLoading={actionLoadingId === order.id}
            onStart={() => updateStatus(order.id, { status: "in_progress" })}
            onMarkReady={() => updateStatus(order.id, { status: "ready" })}
            onCancel={() => setCancelTarget(order)}
          />
        ))}
      </div>

      <CancelOrderModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        loading={actionLoadingId === cancelTarget?.id}
        tableLabel={cancelTarget?.tables?.label ?? "this order"}
      />
    </div>
  );
}
