import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

const UNIQUE_VIOLATION = "23505";

async function getTable(admin: AdminClient, publicCode: string) {
  const { data: table, error } = await admin
    .from("tables")
    .select("id, location_id, tenant_id, is_active")
    .eq("public_code", publicCode)
    .single();

  if (error || !table) {
    return { table: null as never, error: NextResponse.json(
      { error: "Table not found", code: "NOT_FOUND" },
      { status: 404 }
    )};
  }

  if (!table.is_active) {
    return { table: null as never, error: NextResponse.json(
      { error: "Table is inactive", code: "TABLE_INACTIVE" },
      { status: 400 }
    )};
  }

  return { table, error: null };
}

async function getLocationTimeout(admin: AdminClient, locationId: string) {
  const { data: location } = await admin
    .from("locations")
    .select("session_timeout")
    .eq("id", locationId)
    .single();

  return location?.session_timeout ?? 150;
}

function isExpired(startedAt: string, timeoutMinutes: number) {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  return elapsed > timeoutMinutes * 60 * 1000;
}

async function closeSessionAsTimedOut(admin: AdminClient, sessionId: string) {
  await admin
    .from("sessions")
    .update({ status: "closed", closed_at: new Date().toISOString(), closed_by: "timeout" })
    .eq("id", sessionId);
}

/**
 * Returns the active session for a table, or null if there isn't one.
 * If an "active" session is found but has exceeded the location's timeout,
 * it is lazily closed here and treated as if it didn't exist — this is what
 * previously only happened when an order/event was placed on that specific
 * session, which meant a fresh scan of the same table could surface a
 * long-departed customer's stale session as "active".
 */
async function getLiveActiveSession(
  admin: AdminClient,
  tableId: string,
  timeoutMinutes: number
) {
  const { data: existing } = await admin
    .from("sessions")
    .select("id, customer_name, table_id, started_at")
    .eq("table_id", tableId)
    .eq("status", "active")
    .maybeSingle();

  if (!existing) return null;

  if (isExpired(existing.started_at, timeoutMinutes)) {
    await closeSessionAsTimedOut(admin, existing.id);
    return null;
  }

  return existing;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, public_code, customer_name, session_id } = body;
  const admin = createAdminClient();

  if (action === "restore") {
    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { data: session, error: sessErr } = await admin
      .from("sessions")
      .select("id, tenant_id, location_id, table_id, customer_name, status, started_at")
      .eq("id", session_id)
      .single();

    if (sessErr || !session || session.status !== "active") {
      return NextResponse.json(
        { error: "Session not found or expired", code: "SESSION_INACTIVE" },
        { status: 404 }
      );
    }

    const sessionTimeout = await getLocationTimeout(admin, session.location_id);

    if (isExpired(session.started_at, sessionTimeout)) {
      await closeSessionAsTimedOut(admin, session.id);
      return NextResponse.json(
        { error: "Session not found or expired", code: "SESSION_INACTIVE" },
        { status: 404 }
      );
    }

    if (public_code) {
      const { table, error: tableErr } = await getTable(admin, public_code);
      if (tableErr) return tableErr;

      if (session.table_id !== table.id) {
        return NextResponse.json(
          { error: "Session does not belong to this table", code: "SESSION_TABLE_MISMATCH" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      data: {
        id: session.id,
        table_id: session.table_id,
        location_id: session.location_id,
        tenant_id: session.tenant_id,
        customer_name: session.customer_name,
        session_timeout: sessionTimeout,
      },
    });
  }

  if (!public_code) {
    return NextResponse.json(
      { error: "Missing public_code", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const { table, error: tableErr } = await getTable(admin, public_code);
  if (tableErr) return tableErr;

  const sessionTimeout = await getLocationTimeout(admin, table.location_id);

  if (action === "check_table") {
    const existing = await getLiveActiveSession(admin, table.id, sessionTimeout);

    return NextResponse.json({
      data: {
        existing_session: existing
          ? { id: existing.id, customer_name: existing.customer_name }
          : null,
        table_id: table.id,
        location_id: table.location_id,
        tenant_id: table.tenant_id,
      },
    });
  }

  if (action === "join") {
    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id to join", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { data: existing } = await admin
      .from("sessions")
      .select("id, customer_name, table_id, started_at")
      .eq("id", session_id)
      .eq("status", "active")
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Session not found or already closed", code: "SESSION_INACTIVE" },
        { status: 404 }
      );
    }

    if (existing.table_id !== table.id) {
      return NextResponse.json(
        { error: "Session does not belong to this table", code: "SESSION_TABLE_MISMATCH" },
        { status: 400 }
      );
    }

    if (isExpired(existing.started_at, sessionTimeout)) {
      await closeSessionAsTimedOut(admin, existing.id);
      return NextResponse.json(
        { error: "Session not found or already closed", code: "SESSION_INACTIVE" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: existing.id,
        table_id: table.id,
        location_id: table.location_id,
        tenant_id: table.tenant_id,
        customer_name: existing.customer_name,
        session_timeout: sessionTimeout,
      },
    });
  }

  if (action === "create") {
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing customer_name", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const existingActive = await getLiveActiveSession(admin, table.id, sessionTimeout);

    if (existingActive) {
      return NextResponse.json({
        data: {
          id: existingActive.id,
          table_id: table.id,
          location_id: table.location_id,
          tenant_id: table.tenant_id,
          customer_name: existingActive.customer_name,
          session_timeout: sessionTimeout,
        },
      });
    }

    const { data: newSession, error: createErr } = await admin
      .from("sessions")
      .insert({
        tenant_id: table.tenant_id,
        location_id: table.location_id,
        table_id: table.id,
        customer_name: customer_name || null,
      })
      .select()
      .single();

    if (createErr) {
      // Another request created the active session for this table in the
      // window between our check above and this insert (e.g. two people at
      // the same table scanning within milliseconds of each other). The
      // partial unique index on sessions(table_id) WHERE status='active'
      // rejects our insert — fetch and hand back the session that won the
      // race instead of surfacing an error.
      if (createErr.code === UNIQUE_VIOLATION) {
        const winner = await getLiveActiveSession(admin, table.id, sessionTimeout);
        if (winner) {
          return NextResponse.json({
            data: {
              id: winner.id,
              table_id: table.id,
              location_id: table.location_id,
              tenant_id: table.tenant_id,
              customer_name: winner.customer_name,
              session_timeout: sessionTimeout,
            },
          });
        }
      }

      return NextResponse.json(
        { error: "Failed to create session", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          id: newSession.id,
          table_id: newSession.table_id,
          location_id: newSession.location_id,
          tenant_id: newSession.tenant_id,
          customer_name: newSession.customer_name,
          session_timeout: sessionTimeout,
        },
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { error: "Unknown action", code: "VALIDATION_ERROR" },
    { status: 400 }
  );
}
