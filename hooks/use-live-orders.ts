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

export function useLiveOrders(tenantId: string): {
  orders: LiveOrder[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

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
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

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
  }, [tenantId, fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
