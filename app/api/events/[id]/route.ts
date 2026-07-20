import { NextResponse } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { locationId, supabase, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { id } = await params;

  const { data: event, error: eventErr } = await supabase
    .from("table_events")
    .select("id, status, location_id")
    .eq("id", id)
    .single();

  if (eventErr || !event) {
    return NextResponse.json(
      { error: "Event not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const isScopedToLocation = locationId !== null;
  if (isScopedToLocation && event.location_id !== locationId) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  if (event.status !== "pending") {
    return NextResponse.json(
      { error: "Event is already resolved", code: "EVENT_RESOLVED" },
      { status: 400 }
    );
  }

  const { data: updated, error: updateErr } = await supabase
    .from("table_events")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: "Failed to resolve event", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated });
}
