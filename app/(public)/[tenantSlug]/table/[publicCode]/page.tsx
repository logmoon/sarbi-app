export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CustomerShell } from "@/components/customer/customer-shell";
import { FullScreenMessage } from "@/components/customer/full-screen-message";

type PageProps = {
  params: Promise<{ tenantSlug: string; publicCode: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { tenantSlug } = await params;
  const admin = createAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("name")
    .eq("slug", tenantSlug)
    .single();

  if (!tenant) return { title: "Menu not found" };

  return {
    title: `${tenant.name} — Digital Menu`,
    description: `Browse the menu and order from ${tenant.name}`,
  };
}

export default async function CustomerMenuPage({ params }: PageProps) {
  const { tenantSlug, publicCode } = await params;

  const admin = createAdminClient();

  const { data: tenant, error: tenantErr } = await admin
    .from("tenants")
    .select("id, name, slug, plan, logo_url, brand_colors")
    .eq("slug", tenantSlug)
    .single();

  if (tenantErr || !tenant) notFound();

  const { data: table, error: tableErr } = await admin
    .from("tables")
    .select("id, location_id, tenant_id, is_active")
    .eq("public_code", publicCode)
    .eq("tenant_id", tenant.id)
    .single();

  if (tableErr || !table) notFound();

  if (!table.is_active) {
    return (
      <FullScreenMessage
        title="Table Unavailable"
        description="This table is currently inactive. Please ask a staff member for assistance."
      />
    );
  }

  return (
    <CustomerShell
      tenantSlug={tenantSlug}
      publicCode={publicCode}
      tenantName={tenant.name}
      tenantLogo={tenant.logo_url}
      tenantPlan={tenant.plan}
      brandColors={tenant.brand_colors as Record<string, string>}
    />
  );
}
