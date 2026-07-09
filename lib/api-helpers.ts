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
  locationId: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  error?: NextResponse;
}> {
  const { user, supabase } = await getAuthUser();
  if (!user) {
    return {
      tenantId: "",
      locationId: "",
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
    .select("tenant_id, location_id")
    .eq("auth_id", user.id)
    .single();

  if (staffErr || !staff) {
    return {
      tenantId: "",
      locationId: "",
      supabase,
      error: NextResponse.json(
        { error: "Forbidden", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return { tenantId: staff.tenant_id, locationId: staff.location_id, supabase };
}
