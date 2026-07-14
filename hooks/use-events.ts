"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useEvents(sessionId: string | null) {
  const [waiterPending, setWaiterPending] = useState(false);
  const [billPending, setBillPending] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setWaiterPending(false);
      setBillPending(false);
      return;
    }

    const checkInitial = async () => {
      try {
        const [waiterRes, billRes] = await Promise.all([
          fetch(
            `/api/events/check?session_id=${sessionId}&type=waiter_called`
          ),
          fetch(
            `/api/events/check?session_id=${sessionId}&type=bill_requested`
          ),
        ]);
        const waiterData = await waiterRes.json();
        const billData = await billRes.json();
        setWaiterPending(waiterData.pending ?? false);
        setBillPending(billData.pending ?? false);
      } catch {
        // silent
      }
    };

    checkInitial();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
      null;
    let waiterTimer: ReturnType<typeof setTimeout> | null = null;
    let billTimer: ReturnType<typeof setTimeout> | null = null;

    const resetWaiterAfterDelay = () => {
      waiterTimer = setTimeout(() => {
        if (!cancelled) {
          setWaiterPending(false);
          waiterTimer = null;
        }
      }, 5_000);
    };

    const resetBillAfterDelay = () => {
      billTimer = setTimeout(() => {
        if (!cancelled) {
          setBillPending(false);
          billTimer = null;
        }
      }, 5_000);
    };

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`events-session-${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "table_events",
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const record = payload.new as {
              type: string;
              status: string;
            };

            if (record.type === "waiter_called") {
              if (record.status === "pending") {
                setWaiterPending(true);
                if (waiterTimer) {
                  clearTimeout(waiterTimer);
                  waiterTimer = null;
                }
              } else {
                if (!waiterTimer) resetWaiterAfterDelay();
              }
            }

            if (record.type === "bill_requested") {
              if (record.status === "pending") {
                setBillPending(true);
                if (billTimer) {
                  clearTimeout(billTimer);
                  billTimer = null;
                }
              } else {
                if (!billTimer) resetBillAfterDelay();
              }
            }
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (waiterTimer) clearTimeout(waiterTimer);
      if (billTimer) clearTimeout(billTimer);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [sessionId]);

  return { waiterPending, billPending };
}
