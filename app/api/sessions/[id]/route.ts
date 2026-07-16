import { NextResponse } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";

/**
 * Clears a table by force-closing its active session. This is the staff-side
 * counterpart to the customer "Are you with [name]?" decline flow: when a
 * customer declines, they're blocked from ordering rather than silently
 * merged into someone else's session (see hooks/use-session.ts declineSession)
 * — this endpoint is what actually resolves that block, by giving staff a
 * way to end the stale/ambiguous session so the next scan starts fresh.
 *
 * This is a minimal, pulled-forward slice of Task 09 (Floor Staff App) —
 * currently only reachable from the owner/manager Tables dashboard, since
 * the floor app itself doesn't exist yet.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, locationId, supabase, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { id } = await params;

  const { data: session, error: fetchErr } = await supabase
    .from("sessions")
    .select("id, status")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .eq("location_id", locationId)
    .single();

  if (fetchErr || !session) {
    return NextResponse.json(
      { error: "Session not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  if (session.status !== "active") {
    return NextResponse.json(
      { error: "Session is already closed", code: "SESSION_INACTIVE" },
      { status: 400 }
    );
  }

  const { error: updateErr } = await supabase
    .from("sessions")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by: "staff",
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to clear table", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
