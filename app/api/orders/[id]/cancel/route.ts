import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelOrderSchema } from "@/lib/validators";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await request.json();
  const result = cancelOrderSchema.safeParse(body);

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

  const { session_id, reason } = result.data;
  const admin = createAdminClient();

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, session_id, status")
    .eq("id", id)
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: "Order not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (order.session_id !== session_id) {
    return NextResponse.json(
      { error: "Order does not belong to this session", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending orders can be cancelled", code: "INVALID_STATUS" },
      { status: 400 }
    );
  }

  const { data: updated, error: updateErr } = await admin
    .from("orders")
    .update({
      status: "cancelled",
      metadata: { cancelled_by: "customer", reason: reason ?? null },
    })
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: "Failed to cancel order", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated });
}
