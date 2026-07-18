"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/hooks/use-orders";

export type KdsOrder = Order & {
  location_id: string;
  updated_at: string;
  cancelled_reason: string | null;
  tables: { label: string } | null;
};

// How long a `ready` card stays visible before it fades out of the queue.
export const READY_FADE_MS = 8000;

export function useKdsOrders(locationId: string): {
  orders: KdsOrder[];
  loading: boolean;
  error: string | null;
  pendingCount: number;
  refetch: () => Promise<void>;
} {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    const timer = fadeTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      fadeTimers.current.delete(id);
    }
  }, []);

  const scheduleFade = useCallback(
    (id: string) => {
      if (fadeTimers.current.has(id)) return;
      const timer = setTimeout(() => removeOrder(id), READY_FADE_MS);
      fadeTimers.current.set(id, timer);
    },
    [removeOrder]
  );

  const fetchOrders = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?location_id=${encodeURIComponent(locationId)}`);
      if (!res.ok) {
        setError("Failed to load orders");
        return;
      }
      const json = await res.json();
      const fetched: KdsOrder[] = json.data ?? [];
      setOrders(fetched);
      // Anything that arrived already `ready` (e.g. a page refresh shortly
      // after it flipped) should still fade out on its own schedule.
      fetched.forEach((o) => {
        if (o.status === "ready") scheduleFade(o.id);
      });
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [locationId, scheduleFade]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!locationId) return;

    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`kds-orders-location-${locationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `location_id=eq.${locationId}`,
          },
          () => {
            // order_items land in a separate insert right after — refetch
            // rather than rendering a partial row from the payload.
            fetchOrders();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `location_id=eq.${locationId}`,
          },
          (payload) => {
            const updated = payload.new as KdsOrder;

            if (updated.status === "cancelled" || updated.status === "delivered") {
              removeOrder(updated.id);
              return;
            }

            setOrders((prev) => {
              const exists = prev.some((o) => o.id === updated.id);
              if (!exists) return prev;
              return prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o));
            });

            if (updated.status === "ready") {
              scheduleFade(updated.id);
            }
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [locationId, fetchOrders, removeOrder, scheduleFade]);

  useEffect(() => {
    const timers = fadeTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return { orders, loading, error, pendingCount, refetch: fetchOrders };
}
