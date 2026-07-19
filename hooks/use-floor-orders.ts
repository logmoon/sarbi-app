"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/hooks/use-orders";

export type FloorOrder = Order & {
  location_id: string;
  updated_at: string;
  cancelled_reason: string | null;
  tables: { label: string } | null;
};

export function useFloorOrders(locationId: string): {
  orders: FloorOrder[];
  loading: boolean;
  error: string | null;
  confirmDelivered: (orderId: string) => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [orders, setOrders] = useState<FloorOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders?location_id=${encodeURIComponent(locationId)}&all=true`
      );
      if (!res.ok) {
        setError("Failed to load orders");
        return;
      }
      const json = await res.json();
      setOrders(json.data ?? []);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!locationId) return;

    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<
      ReturnType<typeof createClient>["channel"]
    > | null = null;

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`floor-orders-location-${locationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `location_id=eq.${locationId}`,
          },
          () => {
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
            const updated = payload.new as FloorOrder;
            setOrders((prev) => {
              const exists = prev.some((o) => o.id === updated.id);
              if (!exists) {
                return [...prev, updated];
              }
              return prev.map((o) =>
                o.id === updated.id ? { ...o, ...updated } : o
              );
            });
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
  }, [locationId, fetchOrders]);

  const confirmDelivered = useCallback(
    async (orderId: string) => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "delivered" }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          setError(json?.error ?? "Failed to mark as delivered");
          return;
        }
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "delivered" } : o))
        );
      } catch {
        setError("Failed to mark as delivered");
      }
    },
    []
  );

  return { orders, loading, error, confirmDelivered, refetch: fetchOrders };
}
