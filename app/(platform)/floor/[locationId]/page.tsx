export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffRecord } from "@/lib/api-helpers";
import { FloorBoard } from "@/components/floor/floor-board";

type PageProps = {
  params: Promise<{ locationId: string }>;
};

export default async function FloorPage({ params }: PageProps) {
  const { locationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const staff = await getStaffRecord(user.id);
  if (!staff) redirect("/login");

  if (staff.role === "kitchen" || staff.role === "super_admin") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const { data: location } = await admin
    .from("locations")
    .select("id, name, tenant_id")
    .eq("id", locationId)
    .single();

  if (!location) notFound();

  if (location.tenant_id !== staff.tenantId) {
    redirect("/dashboard");
  }

  const isScopedToOwnLocation =
    (staff.role === "floor" || staff.role === "location_manager") &&
    staff.locationId !== null;

  if (isScopedToOwnLocation && staff.locationId !== location.id) {
    redirect("/dashboard");
  }

  return <FloorBoard locationId={location.id} locationName={location.name} />;
}
