export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { CustomerShell } from "@/components/customer/customer-shell";
import { FullScreenMessage } from "@/components/customer/full-screen-message";
import { t } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ tenantSlug: string; publicCode: string }>;
};

function getLocale(headersList: Headers): "ar" | "fr" | "en" {
  return (headersList.get("x-locale") ?? "fr") as "ar" | "fr" | "en";
}

export async function generateMetadata({ params }: PageProps) {
  const { tenantSlug } = await params;
  const headersList = await headers();
  const locale = getLocale(headersList);
  const admin = createAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("name")
    .eq("slug", tenantSlug)
    .single();

  if (!tenant) return { title: t(locale, "meta.menuNotFound") };

  return {
    title: t(locale, "meta.menuTitle", { name: tenant.name }),
    description: t(locale, "meta.menuDesc", { name: tenant.name }),
  };
}

export default async function CustomerMenuPage({ params }: PageProps) {
  const { tenantSlug, publicCode } = await params;
  const headersList = await headers();
  const locale = getLocale(headersList);

  const admin = createAdminClient();

  const { data: tenant, error: tenantErr } = await admin
    .from("tenants")
    .select("id, name, slug, plan, logo_url, cover_url, brand_colors")
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
        title={t(locale, "customer.tableUnavailable")}
        description={t(locale, "customer.tableUnavailableDesc")}
      />
    );
  }

  return (
    <CustomerShell
      tenantSlug={tenantSlug}
      publicCode={publicCode}
      tenantName={tenant.name}
      tenantLogo={tenant.logo_url}
      tenantCover={tenant.cover_url}
      tenantPlan={tenant.plan}
      theme={tenant.brand_colors}
    />
  );
}
