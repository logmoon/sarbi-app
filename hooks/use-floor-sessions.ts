"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/hooks/use-orders";

export type FloorSession = {
  id: string;
  table_id: string;
  customer_name: string | null;
  status: "active" | "closed";
  started_at: string;
  tables: { label: string } | null;
  orders: Order[];
  total: number;
};

function computeTotal(orders: Order[]): number {
  return orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => {
      return (
        sum +
        (o.order_items ?? []).reduce(
          (itemSum, item) => itemSum + (item.subtotal ?? 0),
          0
        )
      );
    }, 0);
}

export function useFloorSessions(locationId: string): {
  sessions: FloorSession[];
  loading: boolean;
  error: string | null;
  clearTable: (sessionId: string) => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [sessions, setSessions] = useState<FloorSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, ordersRes] = await Promise.all([
        fetch(`/api/sessions?location_id=${encodeURIComponent(locationId)}`),
        fetch(
          `/api/orders?location_id=${encodeURIComponent(locationId)}&all=true`
        ),
      ]);

      if (!sessionsRes.ok || !ordersRes.ok) {
        setError("Failed to load session data");
        return;
      }

      const sessionsJson = await sessionsRes.json();
      const ordersJson = await ordersRes.json();

      const rawSessions =
        (sessionsJson.data as FloorSession[]) ?? [];
      const allOrders: Order[] = ordersJson.data ?? [];

      const sessionsWithOrders: FloorSession[] = rawSessions.map((s) => {
        const sessionOrders = allOrders.filter(
          (o: Order) => o.session_id === s.id
        ) as unknown as Order[];
        return {
          ...s,
          orders: sessionOrders,
          total: computeTotal(sessionOrders),
        };
      });

      setSessions(sessionsWithOrders);
    } catch {
      setError("Failed to load session data");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
        .channel(`floor-sessions-location-${locationId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sessions",
            filter: `location_id=eq.${locationId}`,
          },
          () => {
            fetchSessions();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `location_id=eq.${locationId}`,
          },
          () => {
            fetchSessions();
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
  }, [locationId, fetchSessions]);

  const clearTable = useCallback(
    async (sessionId: string) => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          setError(json?.error ?? "Failed to clear table");
          return;
        }
        await fetchSessions();
      } catch {
        setError("Failed to clear table");
      }
    },
    [fetchSessions]
  );

  return { sessions, loading, error, clearTable, refetch: fetchSessions };
}
