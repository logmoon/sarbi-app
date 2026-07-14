"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type OrderItem = {
  id: string;
  order_id: string;
  item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  notes: string | null;
  subtotal: number;
};

export type Order = {
  id: string;
  session_id: string;
  table_id: string;
  customer_name: string | null;
  notes: string | null;
  status: "pending" | "in_progress" | "ready" | "delivered" | "cancelled";
  created_at: string;
  order_items: OrderItem[];
};

export function useOrders(sessionId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?session_id=${encodeURIComponent(sessionId)}`);
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
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      setOrders([]);
      setError(null);
      return;
    }
    fetchOrders();
  }, [sessionId, fetchOrders]);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`orders-session-${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `session_id=eq.${sessionId}`,
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
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
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
  }, [sessionId, fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
