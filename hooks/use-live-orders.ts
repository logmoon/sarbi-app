"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export type LiveOrderItem = {
  id: string;
  order_id: string;
  item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  notes: string | null;
  subtotal: number;
};

export type LiveOrder = {
  id: string;
  tenant_id: string;
  location_id: string;
  session_id: string;
  table_id: string;
  customer_name: string | null;
  notes: string | null;
  status: "pending" | "in_progress" | "ready" | "delivered" | "cancelled";
  created_at: string;
  updated_at: string;
  cancelled_reason: string | null;
  order_items: LiveOrderItem[];
  tables: { label: string } | null;
  locations: { name: string } | null;
};

// How long a `delivered` order stays visible before it fades out of the list.
export const DELIVERED_FADE_MS = 30_000;

export function useLiveOrders(tenantId: string): {
  orders: LiveOrder[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

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
      const timer = setTimeout(() => removeOrder(id), DELIVERED_FADE_MS);
      fadeTimers.current.set(id, timer);
    },
    [removeOrder]
  );

  const fetchOrders = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders?tenant_id=${encodeURIComponent(tenantId)}`
      );
      if (!res.ok) {
        setError("Failed to load orders");
        return;
      }
      const json = await res.json();
      const fetched: LiveOrder[] = json.data ?? [];
      setOrders(fetched);
      // Anything that arrived already `delivered` (page refresh shortly
      // after floor confirmed it) fades on its own schedule.
      fetched.forEach((o) => {
        if (o.status === "delivered") scheduleFade(o.id);
      });
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [tenantId, scheduleFade]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`live-orders-tenant-${tenantId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `tenant_id=eq.${tenantId}`,
          },
          () => {
            // order_items land in a separate insert right after the order
            // row — refetch to render the full row including items.
            fetchOrders();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            const updated = payload.new as LiveOrder;

            // Tenant mismatch: another tenant's update leaked into our
            // subscription (shouldn't happen with RLS, but defensive).
            if (updated.tenant_id !== tenantId) return;

            if (updated.status === "delivered") {
              setOrders((prev) => {
                const exists = prev.some((o) => o.id === updated.id);
                if (!exists) return prev;
                return prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o));
              });
              scheduleFade(updated.id);
              return;
            }

            setOrders((prev) => {
              const exists = prev.some((o) => o.id === updated.id);
              if (!exists) return prev;
              return prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o));
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
  }, [tenantId, fetchOrders, scheduleFade]);

  useEffect(() => {
    const timers = fadeTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return { orders, loading, error, refetch: fetchOrders };
}
