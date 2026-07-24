import { NextResponse, type NextRequest } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { updateTenantSettingsSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, supabase, error } = await getStaffTenantAndLocation();
  if (error) return error;

  const { id } = await params;
  if (id !== tenantId) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, name, slug, logo_url, cover_url, brand_colors, plan")
    .eq("id", id)
    .single();

  if (tenantErr || !tenant) {
    return NextResponse.json(
      { error: "Tenant not found", code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: locations, error: locErr } = await supabase
    .from("locations")
    .select("id, name, address, session_timeout, is_active")
    .order("created_at", { ascending: true });

  if (locErr) {
    return NextResponse.json(
      { error: "Failed to fetch locations", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { tenant, locations: locations ?? [] } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tenantId, supabase, staffId, error } =
    await getStaffTenantAndLocation();
  if (error) return error;

  const { id } = await params;
  if (id !== tenantId) {
    return NextResponse.json(
      { error: "Forbidden", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const { data: staff } = await supabase
    .from("staff")
    .select("role")
    .eq("id", staffId)
    .single();

  if (!staff || (staff.role !== "owner" && staff.role !== "super_admin")) {
    return NextResponse.json(
      { error: "Only owners can update tenant settings", code: "FORBIDDEN" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const result = updateTenantSettingsSchema.safeParse(body);

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

  const { data: tenant, error: updateErr } = await supabase
    .from("tenants")
    .update(result.data)
    .eq("id", id)
    .select("id, name, slug, logo_url, cover_url, brand_colors, plan")
    .single();

  if (updateErr || !tenant) {
    return NextResponse.json(
      { error: "Failed to update tenant", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: tenant });
}
