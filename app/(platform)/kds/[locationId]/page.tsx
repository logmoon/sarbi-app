export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffRecord } from "@/lib/api-helpers";
import { KdsBoard } from "@/components/kds/kds-board";

type PageProps = {
  params: Promise<{ locationId: string }>;
};

export default async function KdsPage({ params }: PageProps) {
  const { locationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const staff = await getStaffRecord(user.id);
  if (!staff) redirect("/login");

  // Floor/super_admin shouldn't reach here at all — the (platform) layout
  // already redirects them elsewhere. This is defense in depth, not the
  // primary gate.
  if (staff.role === "floor" || staff.role === "super_admin") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const { data: location } = await admin
    .from("locations")
    .select("id, name, tenant_id")
    .eq("id", locationId)
    .single();

  if (!location) notFound();

  // Tenant boundary — never let staff view another tenant's KDS.
  if (location.tenant_id !== staff.tenantId) {
    redirect("/dashboard");
  }

  // Kitchen staff and single-location managers are scoped to their own
  // location. Owners and multi-location managers (locationId is null) can
  // view any location within their own tenant.
  const isScopedToOwnLocation =
    (staff.role === "kitchen" || staff.role === "location_manager") &&
    staff.locationId !== null;

  if (isScopedToOwnLocation && staff.locationId !== location.id) {
    redirect("/dashboard");
  }

  return <KdsBoard locationId={location.id} locationName={location.name} />;
}
