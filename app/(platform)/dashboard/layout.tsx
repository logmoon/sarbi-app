import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStaffRecord } from "@/lib/api-helpers";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const staff = user ? await getStaffRecord(user.id) : null;

  // Role/location come from the `staff` table, never from `user.app_metadata`.
  // The custom_access_token_hook (migration 004) writes `user_role` into the
  // JWT's own claims, which `getUser()` does not surface. See getStaffRecord().
  // Kitchen/floor staff have their own dedicated apps, never the admin
  // dashboard. This redirect lives here (not in the shared (platform) layout)
  // so it only ever fires for /dashboard/** — /kds and /floor never pass
  // through it, so there's no way for this to loop against itself.
  if ((staff?.role === "kitchen" || staff?.role === "floor") && staff.locationId) {
    redirect(`${staff.role === "kitchen" ? "/kds" : "/floor"}/${staff.locationId}`);
  }

  if (staff?.role === "super_admin") {
    redirect("/superadmin");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar staffLocationId={staff?.locationId ?? null} />
      <main className="flex-1 overflow-auto p-6 pt-14 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
