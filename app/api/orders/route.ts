import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderSchema } from "@/lib/validators";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";

const KDS_STATUSES = ["pending", "in_progress", "ready"];
const READY_STALE_MS = 2 * 60 * 1000; // exclude orders that went `ready` more than 2 min ago
// Dashboard "live" view: 24h is wide enough to cover a full day of
// cancellations but narrow enough that the list never accumulates
// historical noise. Active orders (pending/in_progress/ready) inside
// this window are always shown; delivered orders are gated separately
// by READY_STALE_MS so they fade on the 30s client schedule.
const DASHBOARD_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const locationId = request.nextUrl.searchParams.get("location_id");
  const tenantIdParam = request.nextUrl.searchParams.get("tenant_id");

  if (locationId) {
    const { locationId: staffLocationId, supabase, error } =
      await getStaffTenantAndLocation();
    if (error) return error;

    const isScopedToLocation = staffLocationId !== null;
    if (isScopedToLocation && staffLocationId !== locationId) {
      return NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const fetchAll = request.nextUrl.searchParams.get("all") === "true";

    const readyCutoff = new Date(Date.now() - READY_STALE_MS).toISOString();

    let ordersQuery = supabase
      .from("orders")
      .select("*, order_items(*), tables(label)");

    if (isScopedToLocation) {
      ordersQuery = ordersQuery.eq("location_id", staffLocationId);
    }

    if (!fetchAll) {
      ordersQuery = ordersQuery
        .in("status", KDS_STATUSES)
        .or(`status.neq.ready,updated_at.gte.${readyCutoff}`);
    }

    const { data: orders, error: ordersErr } = await ordersQuery.order(
      "created_at",
      { ascending: true }
    );

    if (ordersErr) {
      return NextResponse.json(
        { error: "Failed to fetch orders", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: orders ?? [] });
  }

  if (tenantIdParam) {
    // Owner-level view: used by the dashboard Live Orders page for owners
    // / super_admins / multi-location managers who have no single
    // assigned location. RLS already restricts to the caller's tenant,
    // but we also enforce the explicit tenantId check here as the
    // primary defense (per invariant #1).
    const { tenantId, locationId: staffLocationId, supabase, error } =
      await getStaffTenantAndLocation();
    if (error) return error;

    if (tenantIdParam !== tenantId) {
      return NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // Without a time bound the dashboard would return every cancelled
    // order the tenant has ever had. We constrain to the last 24 hours
    // so the owner sees "what's happening now + what was cancelled
    // during the day" but not historical noise from 11 days ago. The
    // client groups active orders vs. recent cancellations for display.
    const dashboardCutoff = new Date(
      Date.now() - DASHBOARD_WINDOW_MS
    ).toISOString();
    const readyCutoff = new Date(Date.now() - READY_STALE_MS).toISOString();

    let ordersQuery = supabase
      .from("orders")
      .select("*, order_items(*), tables(label), locations(name)")
      .gte("created_at", dashboardCutoff)
      .in("status", [...KDS_STATUSES, "delivered", "cancelled"])
      .or(`status.neq.delivered,updated_at.gte.${readyCutoff}`);

    if (staffLocationId !== null) {
      ordersQuery = ordersQuery.eq("location_id", staffLocationId);
    }

    const { data: orders, error: ordersErr } = await ordersQuery.order(
      "created_at",
      { ascending: true }
    );

    if (ordersErr) {
      return NextResponse.json(
        { error: "Failed to fetch orders", code: "DB_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: orders ?? [] });
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: session, error: sessionErr } = await admin
    .from("sessions")
    .select("tenant_id")
    .eq("id", sessionId)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json(
      { error: "Session not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: orders, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("tenant_id", session.tenant_id)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: orders ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = createOrderSchema.safeParse(body);

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

  const admin = createAdminClient();
  const { session_id, items, notes } = result.data;

  const { data: session, error: sessionErr } = await admin
    .from("sessions")
    .select("id, tenant_id, location_id, table_id, status, customer_name, started_at")
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

  const { data: tenant } = await admin
    .from("tenants")
    .select("plan")
    .eq("id", session.tenant_id)
    .single();

  if (tenant?.plan === "starter") {
    return NextResponse.json(
      { error: "Orders are not available on the current plan", code: "PLAN_RESTRICTED" },
      { status: 403 }
    );
  }

  const itemIds = items.map((i) => i.item_id);
  const { data: dbItems, error: itemsErr } = await admin
    .from("items")
    .select("id, name, price, is_available")
    .in("id", itemIds);

  if (itemsErr || !dbItems) {
    return NextResponse.json(
      { error: "Failed to fetch items", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  const unavailableItemIds = items
    .filter((ordered) => {
      const dbItem = dbItems.find((i) => i.id === ordered.item_id);
      return !dbItem || !dbItem.is_available;
    })
    .map((i) => i.item_id);

  if (unavailableItemIds.length > 0) {
    return NextResponse.json(
      {
        error: "Some items are no longer available",
        code: "ITEMS_UNAVAILABLE",
        details: { item_ids: unavailableItemIds },
      },
      { status: 409 }
    );
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      tenant_id: session.tenant_id,
      location_id: session.location_id,
      session_id: session.id,
      table_id: session.table_id,
      customer_name: session.customer_name,
      notes: notes ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: "Failed to create order", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  const orderItemsData = items.map((ordered) => {
    const dbItem = dbItems.find((i) => i.id === ordered.item_id)!;
    const snapshotName =
      dbItem.name?.en ?? dbItem.name?.fr ?? dbItem.name?.ar ?? "Item";
    const price = Number(dbItem.price);
    const quantity = ordered.quantity;
    return {
      order_id: order.id,
      item_id: ordered.item_id,
      item_name: snapshotName,
      item_price: price,
      quantity,
      notes: ordered.notes ?? null,
      subtotal: price * quantity,
    };
  });

  const { error: itemsInsertErr } = await admin
    .from("order_items")
    .insert(orderItemsData);

  if (itemsInsertErr) {
    await admin.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Failed to create order items", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      data: {
        ...order,
        items: orderItemsData,
      },
    },
    { status: 201 }
  );
}
