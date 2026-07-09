import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getTable(admin: ReturnType<typeof createAdminClient>, publicCode: string) {
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

async function getLocationTimeout(admin: ReturnType<typeof createAdminClient>, locationId: string) {
  const { data: location } = await admin
    .from("locations")
    .select("session_timeout")
    .eq("id", locationId)
    .single();

  return location?.session_timeout ?? 150;
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
      .select("id, tenant_id, location_id, table_id, customer_name, status")
      .eq("id", session_id)
      .single();

    if (sessErr || !session || session.status !== "active") {
      return NextResponse.json(
        { error: "Session not found or expired", code: "SESSION_INACTIVE" },
        { status: 404 }
      );
    }

    const sessionTimeout = await getLocationTimeout(admin, session.location_id);

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
    const { data: existing } = await admin
      .from("sessions")
      .select("id, customer_name")
      .eq("table_id", table.id)
      .eq("status", "active")
      .maybeSingle();

    return NextResponse.json({
      data: {
        existing_session: existing ?? null,
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
      .select("id, customer_name, table_id")
      .eq("id", session_id)
      .eq("status", "active")
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Session not found or already closed", code: "SESSION_INACTIVE" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: existing.id,
        table_id: existing.table_id,
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
  }

  const { data: existingActive } = await admin
    .from("sessions")
    .select("id, customer_name")
    .eq("table_id", table.id)
    .eq("status", "active")
    .maybeSingle();

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
