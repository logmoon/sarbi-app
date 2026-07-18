import { createClient } from "@/lib/supabase/server";
import { getStaffRecord } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Role/location come from the `staff` table, never from `user.app_metadata`.
  // The custom_access_token_hook (migration 004) writes `user_role` into the
  // JWT's own claims, which `getUser()` does not surface — reading it off
  // `app_metadata` here silently never matched, so kitchen/floor/super_admin
  // staff were never redirected to their own app. See getStaffRecord().
  const staff = await getStaffRecord(user.id);
  const role = staff?.role;
  const currentPath = headers().get("x-pathname") ?? "";

  if ((role === "kitchen" || role === "floor") && staff?.locationId) {
    const target = role === "kitchen" ? "/kds" : "/floor";
    const destination = `${target}/${staff.locationId}`;
    // Guard against redirecting to the page the user is already on —
    // without this, visiting that exact URL would redirect to itself
    // on every request.
    if (currentPath !== destination) {
      redirect(destination);
    }
  }

  if (role === "super_admin" && currentPath !== "/superadmin") {
    redirect("/superadmin");
  }

  return <>{children}</>;
}
