import { NextResponse } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { locationId, supabase, error } = await getStaffTenantAndLocation();
  if (error) return error;

  // location_id is chained directly into every query below (not just
  // checked after the fact) — RLS is the backstop, this is the primary
  // defense per invariant #1.
  let orderQuery = supabase
    .from("orders")
    .select("id, status, cancelled_acknowledged_at")
    .eq("id", id);

  const isScopedToLocation = locationId !== null;
  if (isScopedToLocation) {
    orderQuery = orderQuery.eq("location_id", locationId);
  }

  const { data: order, error: orderErr } = await orderQuery.single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: "Order not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (order.status !== "cancelled") {
    return NextResponse.json(
      { error: "Only cancelled orders can be acknowledged", code: "INVALID_STATE" },
      { status: 400 }
    );
  }

  // Already acknowledged — return as-is rather than erroring, so a second
  // tap (or a second screen racing to acknowledge the same order) is a
  // harmless no-op instead of a surfaced failure.
  if (order.cancelled_acknowledged_at) {
    return NextResponse.json({ data: order });
  }

  let updateQuery = supabase
    .from("orders")
    .update({ cancelled_acknowledged_at: new Date().toISOString() })
    .eq("id", id);

  if (isScopedToLocation) {
    updateQuery = updateQuery.eq("location_id", locationId);
  }

  const { data: updated, error: updateErr } = await updateQuery
    .select("*, order_items(*), tables(label)")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: "Failed to acknowledge order", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated });
}
