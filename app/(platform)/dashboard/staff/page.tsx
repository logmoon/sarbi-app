import { createClient } from "@/lib/supabase/server";
import { getStaffRecord } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import { StaffManager, type StaffMember, type StaffLocation } from "@/components/staff/staff-manager";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const staff = await getStaffRecord(user.id);
  if (!staff) redirect("/login");

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("id", staff.tenantId)
    .single();

  const { data: locations, error: locErr } = await supabase
    .from("locations")
    .select("id, name")
    .eq("tenant_id", staff.tenantId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (tenantErr || !tenant || locErr) {
    return (
      <div className="rounded-sm border border-status-error bg-status-error/10 p-4 text-sm text-status-error">
        Failed to load staff.
      </div>
    );
  }

  const { data: members } = await supabase
    .from("staff")
    .select("id, email, name, role, location_id, is_active, auth_id, created_at, locations(name)")
    .eq("tenant_id", staff.tenantId)
    .order("created_at", { ascending: true });

  const staffMembers: StaffMember[] = (members ?? []).map((m) => {
    const { locations: loc, auth_id, ...rest } = m as typeof m & {
      locations: { name: string } | null;
    };
    return {
      ...rest,
      location_name: loc?.name ?? null,
      has_auth: Boolean(auth_id),
    };
  });

  const staffLocations: StaffLocation[] = (locations ?? []).map((l) => ({
    id: l.id,
    name: l.name,
  }));

  const canManage = staff.role === "owner" || staff.role === "super_admin";

  return (
    <StaffManager
      members={staffMembers}
      locations={staffLocations}
      canManage={canManage}
      currentUserId={staff.staffId}
      tenantId={staff.tenantId}
    />
  );
}
