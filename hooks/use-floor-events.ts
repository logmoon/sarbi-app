"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type FloorEvent = {
  id: string;
  location_id: string;
  session_id: string | null;
  table_id: string;
  type: "waiter_called" | "bill_requested" | "check_needed";
  status: "pending" | "resolved";
  metadata: Record<string, unknown>;
  created_at: string;
  sessions?: { customer_name: string | null } | null;
  tables?: { label: string } | null;
};

export function useFloorEvents(locationId: string): {
  events: FloorEvent[];
  loading: boolean;
  error: string | null;
  resolveEvent: (eventId: string) => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [events, setEvents] = useState<FloorEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/events?location_id=${encodeURIComponent(locationId)}`
      );
      if (!res.ok) {
        setError("Failed to load events");
        return;
      }
      const json = await res.json();
      setEvents(json.data ?? []);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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
        .channel(`floor-events-location-${locationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "table_events",
            filter: `location_id=eq.${locationId}`,
          },
          () => {
            fetchEvents();
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
  }, [locationId, fetchEvents]);

  const resolveEvent = useCallback(async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
      });
      if (!res.ok) {
        setError("Failed to resolve event");
        return;
      }
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      setError("Failed to resolve event");
    }
  }, []);

  return {
    events,
    loading,
    error,
    resolveEvent,
    refetch: fetchEvents,
  };
}
