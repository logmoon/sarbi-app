import { createClient } from "@/lib/supabase/server";
import { getStaffRecord } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import { LiveOrders } from "@/components/orders/live-orders";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const staff = await getStaffRecord(user.id);
  if (!staff) redirect("/login");

  return <LiveOrders tenantId={staff.tenantId} />;
}
