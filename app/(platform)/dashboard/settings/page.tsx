import { createClient } from "@/lib/supabase/server";
import { getStaffRecord } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import { SettingsForm, type SettingsData } from "@/components/settings/settings-form";
import { parseMenuTheme } from "@/lib/brand";
import { menuFontVariables } from "@/lib/fonts";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const staff = await getStaffRecord(user.id);
  if (!staff) redirect("/login");

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .select("id, name, slug, logo_url, cover_url, brand_colors, plan")
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
  // into the shape our settings form expects. If the owner stored nothing
  // usable, fall back to the default Sarbi amber + defaults for every
  // other theme knob, so the preview and customer page always have a
  // fully-defined theme. Validation of the actual write path lives in
  // lib/validators.ts#menuThemeSchema.
  const theme = parseMenuTheme(tenant.brand_colors) ?? {
    primary: "#F59E0B",
    surface: "light" as const,
    font: "modern" as const,
    layout: "grid" as const,
  };

  const data: SettingsData = {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo_url: tenant.logo_url,
      cover_url: tenant.cover_url,
      brand_colors: theme,
    },
    locations: (locations ?? []).map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      session_timeout: loc.session_timeout,
    })),
    canEdit: staff.role === "owner" || staff.role === "super_admin",
  };

  // menuFontVariables makes the curated heading-font presets available as
  // CSS vars for the live preview — see lib/fonts.ts.
  return (
    <div className={menuFontVariables}>
      <SettingsForm data={data} />
    </div>
  );
}
