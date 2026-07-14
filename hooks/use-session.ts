"use client";

import { useState, useCallback } from "react";
import {
  getSessionCookie,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/session-cookie";

export type SessionState = {
  session_id: string;
  table_id: string;
  location_id: string;
  tenant_id: string;
  customer_name: string | null;
};

export function useSession(publicCode: string) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingSession, setExistingSession] = useState<{
    id: string;
    customer_name: string | null;
  } | null>(null);

  const restoreSession = useCallback(async (): Promise<SessionState | null> => {
    const cookieId = getSessionCookie();
    if (!cookieId) return null;

    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          session_id: cookieId,
          public_code: publicCode,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const s = json.data;
        const sessionState: SessionState = {
          session_id: s.id,
          table_id: s.table_id,
          location_id: s.location_id,
          tenant_id: s.tenant_id,
          customer_name: s.customer_name,
        };
        setSession(sessionState);
        setSessionCookie(s.id, s.session_timeout ?? 150);
        return sessionState;
      }
      clearSessionCookie();
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicCode]);

  const checkForActiveSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_table",
          public_code: publicCode,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data?.existing_session) {
        setExistingSession(json.data.existing_session);
        return json.data.existing_session;
      }
      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicCode]);

  const createSession = useCallback(
    async (customerName: string): Promise<SessionState | null> => {
      setLoading(true);
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            public_code: publicCode,
            customer_name: customerName,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        const s = json.data;
        const sessionState: SessionState = {
          session_id: s.id,
          table_id: s.table_id,
          location_id: s.location_id,
          tenant_id: s.tenant_id,
          customer_name: s.customer_name,
        };
        setSession(sessionState);
        setSessionCookie(s.id, s.session_timeout ?? 150);
        return sessionState;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicCode]
  );

  const joinSession = useCallback(
    async (): Promise<SessionState | null> => {
      if (!existingSession) return null;
      setLoading(true);
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            public_code: publicCode,
            session_id: existingSession.id,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        const s = json.data;
        const sessionState: SessionState = {
          session_id: s.id,
          table_id: s.table_id,
          location_id: s.location_id,
          tenant_id: s.tenant_id,
          customer_name: s.customer_name,
        };
        setSession(sessionState);
        setSessionCookie(s.id, s.session_timeout ?? 150);
        setExistingSession(null);
        return sessionState;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicCode, existingSession]
  );

  const declineSession = useCallback(async () => {
    if (!existingSession) return;
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: existingSession.id,
          type: "check_needed",
        }),
      });
    } catch {
      // best-effort for this side-effect
    }
    setExistingSession(null);
  }, [existingSession]);

  const endSession = useCallback(() => {
    clearSessionCookie();
    setSession(null);
  }, []);

  return {
    session,
    loading,
    existingSession,
    restoreSession,
    checkForActiveSession,
    createSession,
    joinSession,
    declineSession,
    endSession,
  };
}
