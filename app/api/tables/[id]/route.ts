import { NextResponse } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { updateTableSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, locationId, supabase, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { id } = await params;

  const { data: existing } = await supabase
    .from("tables")
    .select("id")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .eq("location_id", locationId)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Table not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const result = updateTableSchema.safeParse(body);

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

  const { data: table, error: dbError } = await supabase
    .from("tables")
    .update(result.data)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to update table", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: table });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, locationId, supabase, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { id } = await params;

  const { data: existing } = await supabase
    .from("tables")
    .select("id")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .eq("location_id", locationId)
    .single();

  if (!existing) {
    return NextResponse.json(
      { error: "Table not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: activeSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("table_id", id)
    .is("closed_at", null)
    .maybeSingle();

  if (activeSession) {
    return NextResponse.json(
      {
        error: "Cannot delete table with active session. Clear the table first.",
        code: "ACTIVE_SESSION",
      },
      { status: 409 }
    );
  }

  const { error: dbError } = await supabase
    .from("tables")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to delete table", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
