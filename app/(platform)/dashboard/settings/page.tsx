import { createClient } from "@/lib/supabase/server";
import { getStaffRecord } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import { SettingsForm, type SettingsData } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const staff = await getStaffRecord(user.id);
  if (!staff) redirect("/login");

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, name, slug, logo_url, brand_colors, plan")
    .eq("id", staff.tenantId)
    .single();

  const { data: locations, error: locErr } = await supabase
    .from("locations")
    .select("id, name, address, session_timeout, is_active")
    .eq("tenant_id", staff.tenantId)
    .order("created_at", { ascending: true });

  if (tenantErr || !tenant || locErr) {
    return (
      <div className="rounded-sm border border-status-error bg-status-error/10 p-4 text-sm text-status-error">
        Failed to load settings.
      </div>
    );
  }

  // Defensive: brand_colors is JSONB, so we coerce whatever the DB has
  // into the shape our settings form expects. If the owner stored
  // nothing usable, fall back to the default Sarbi amber so the preview
  // and customer page always have a defined color. Validation of the
  // actual write path lives in lib/validators.ts#brandColorsSchema.
  const stored = (tenant.brand_colors ?? {}) as { primary?: unknown };
  const brandPrimary =
    typeof stored.primary === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(stored.primary)
      ? stored.primary.toUpperCase()
      : "#F59E0B";

  const data: SettingsData = {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      brand_colors: { primary: brandPrimary },
    },
    locations: (locations ?? []).map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      session_timeout: loc.session_timeout,
    })),
    canEdit: staff.role === "owner" || staff.role === "super_admin",
  };

  return <SettingsForm data={data} />;
}
