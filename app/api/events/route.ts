import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTableEventSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const result = createTableEventSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { session_id, type } = result.data;
  const admin = createAdminClient();

  const { data: session, error: sessionErr } = await admin
    .from("sessions")
    .select("id, tenant_id, location_id, table_id, status, started_at")
    .eq("id", session_id)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json(
      { error: "Session not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (session.status !== "active") {
    return NextResponse.json(
      { error: "Session is not active", code: "SESSION_INACTIVE" },
      { status: 400 }
    );
  }

  const { data: location } = await admin
    .from("locations")
    .select("session_timeout")
    .eq("id", session.location_id)
    .single();

  const timeoutMinutes = location?.session_timeout ?? 150;
  const startedAt = new Date(session.started_at).getTime();
  const elapsed = Date.now() - startedAt;
  if (elapsed > timeoutMinutes * 60 * 1000) {
    await admin
      .from("sessions")
      .update({ status: "closed", closed_at: new Date().toISOString(), closed_by: "timeout" })
      .eq("id", session.id);
    return NextResponse.json(
      { error: "Session has expired", code: "SESSION_TIMEOUT" },
      { status: 400 }
    );
  }

  if (type === "waiter_called" || type === "bill_requested") {
    const { data: existing } = await admin
      .from("table_events")
      .select("id, metadata")
      .eq("tenant_id", session.tenant_id)
      .eq("session_id", session.id)
      .eq("type", type)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ data: existing }, { status: 200 });
    }
  }

  const metadata: Record<string, unknown> = {};

  if (type === "bill_requested") {
    const { data: deliveredOrders } = await admin
      .from("orders")
      .select("id")
      .eq("session_id", session.id)
      .eq("status", "delivered");

    if (!deliveredOrders || deliveredOrders.length === 0) {
      return NextResponse.json(
        { error: "No delivered orders to bill", code: "NO_DELIVERED_ORDERS" },
        { status: 400 }
      );
    }

    const { data: orders } = await admin
      .from("orders")
      .select("id")
      .eq("session_id", session.id)
      .not("status", "eq", "cancelled");

    if (orders && orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const { data: orderItems } = await admin
        .from("order_items")
        .select("subtotal")
        .in("order_id", orderIds);

      const runningTotal = (orderItems ?? []).reduce(
        (sum, item) => sum + Number(item.subtotal),
        0
      );
      metadata.running_total = runningTotal;
    }
  }

  const { data: event, error: eventErr } = await admin
    .from("table_events")
    .insert({
      tenant_id: session.tenant_id,
      location_id: session.location_id,
      session_id: session.id,
      table_id: session.table_id,
      type,
      metadata,
    })
    .select()
    .single();

  if (eventErr) {
    return NextResponse.json(
      { error: "Failed to create event", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: event }, { status: 201 });
}
