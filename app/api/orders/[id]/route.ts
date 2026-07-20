import { NextResponse } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { updateOrderStatusSchema } from "@/lib/validators";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["in_progress", "cancelled"],
  in_progress: ["ready", "cancelled"],
  ready: ["delivered"],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await request.json();
  const result = updateOrderStatusSchema.safeParse(body);

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

  const { locationId, staffId, supabase, error } = await getStaffTenantAndLocation();
  if (error) return error;

  // location_id is chained directly into every query below (not just
  // checked after the fact) — RLS is the backstop, this is the primary
  // defense per invariant #1.
  let orderQuery = supabase
    .from("orders")
    .select("id, status")
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

  const nextStatus = result.data.status;
  const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowedNext.includes(nextStatus)) {
    return NextResponse.json(
      {
        error: `Cannot move an order from "${order.status}" to "${nextStatus}"`,
        code: "INVALID_TRANSITION",
      },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = {
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  if (result.data.status === "cancelled") {
    const reasonText =
      result.data.reason_code === "other" && result.data.reason_note
        ? result.data.reason_note
        : result.data.reason_code;
    updatePayload.cancelled_reason = reasonText;
    updatePayload.cancelled_by = staffId;
  }

  let updateQuery = supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", id);

  if (isScopedToLocation) {
    updateQuery = updateQuery.eq("location_id", locationId);
  }

  const { data: updated, error: updateErr } = await updateQuery
    .select("*, order_items(*), tables(label)")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: "Failed to update order", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated });
}
