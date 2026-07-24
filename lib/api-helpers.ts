import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabase };
}

export async function getStaffTenantId(): Promise<{
  tenantId: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  error?: NextResponse;
}> {
  const { user, supabase } = await getAuthUser();
  if (!user) {
    return {
      tenantId: "",
      supabase,
      error: NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();
  const { data: staff } = await admin
    .from("staff")
    .select("tenant_id")
    .eq("auth_id", user.id)
    .eq("is_active", true)
    .single();

  if (!staff) {
    return {
      tenantId: "",
      supabase,
      error: NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return { tenantId: staff.tenant_id, supabase };
}

export async function getStaffTenantAndLocation(): Promise<{
  tenantId: string;
  locationId: string | null;
  staffId: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  error?: NextResponse;
}> {
  const { user, supabase } = await getAuthUser();
  if (!user) {
    return {
      tenantId: "",
      locationId: "",
      staffId: "",
      supabase,
      error: NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();
  const { data: staff, error: staffErr } = await admin
    .from("staff")
    .select("id, tenant_id, location_id")
    .eq("auth_id", user.id)
    .eq("is_active", true)
    .single();

  if (staffErr || !staff) {
    return {
      tenantId: "",
      locationId: "",
      staffId: "",
      supabase,
      error: NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return {
    tenantId: staff.tenant_id,
    locationId: staff.location_id,
    staffId: staff.id,
    supabase,
  };
}

export type StaffRole =
  | "super_admin"
  | "owner"
  | "location_manager"
  | "kitchen"
  | "floor";

export type StaffRecord = {
  staffId: string;
  tenantId: string;
  locationId: string | null;
  role: StaffRole;
};

/**
 * Looks up a staff member's role/tenant/location straight from the `staff`
 * table. Do NOT read role off `user.app_metadata` — the custom_access_token_hook
 * (migration 004) writes `user_role` into the JWT's claims, not into the
 * `auth.users.raw_app_meta_data` column that `getUser()` surfaces, so
 * `user.app_metadata?.user_role` is always undefined. The `staff` table is
 * the single source of truth for role/location, consistent with every other
 * staff-authenticated route in this codebase.
 *
 * `is_active` is filtered here rather than left to the JWT claim: migration
 * 019 nulls out `user_role` in the token for deactivated staff, but nothing
 * in the app actually reads that claim (see above) — so without this
 * filter, a deactivated account still resolves a full role/location here
 * and keeps working everywhere this function gates access.
 */
export async function getStaffRecord(authId: string): Promise<StaffRecord | null> {
  const admin = createAdminClient();
  const { data: staff, error } = await admin
    .from("staff")
    .select("id, tenant_id, location_id, role")
    .eq("auth_id", authId)
    .eq("is_active", true)
    .single();

  if (error || !staff) return null;

  return {
    staffId: staff.id,
    tenantId: staff.tenant_id,
    locationId: staff.location_id,
    role: staff.role as StaffRole,
  };
}
