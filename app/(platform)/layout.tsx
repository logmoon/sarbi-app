import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

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

  const role = user.app_metadata?.user_role as string | undefined;

  if (role === "kitchen" || role === "floor") {
    const admin = createAdminClient();
    const { data: staff } = await admin
      .from("staff")
      .select("location_id")
      .eq("auth_id", user.id)
      .single();

    if (staff?.location_id) {
      const target = role === "kitchen" ? "/kds" : "/floor";
      redirect(`${target}/${staff.location_id}`);
    }
  }

  if (role === "super_admin") {
    redirect("/superadmin");
  }

  return <>{children}</>;
}
