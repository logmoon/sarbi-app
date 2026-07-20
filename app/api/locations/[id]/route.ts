import { NextResponse, type NextRequest } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { updateLocationSettingsSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, locationId, supabase, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { id } = await params;

  let locationQuery = supabase
    .from("locations")
    .select("id, tenant_id")
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (locationId !== null) {
    locationQuery = locationQuery.eq("id", locationId);
  }

  const { data: location, error: fetchErr } = await locationQuery.single();

  if (fetchErr || !location) {
    return NextResponse.json(
      { error: "Location not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const result = updateLocationSettingsSchema.safeParse(body);

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

  if (Object.keys(result.data).length === 0) {
    return NextResponse.json(
      { error: "No fields to update", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (result.data.name !== undefined) updateData.name = result.data.name;
  if (result.data.address !== undefined) updateData.address = result.data.address;
  if (result.data.session_timeout !== undefined)
    updateData.session_timeout = result.data.session_timeout;

  const { data: updated, error: updateErr } = await supabase
    .from("locations")
    .update(updateData)
    .eq("id", id)
    .select("id, name, address, session_timeout, is_active")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: "Failed to update location", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updated });
}
