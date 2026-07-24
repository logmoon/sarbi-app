import { createClient } from "@/lib/supabase/server";
import { getStaffRecord } from "@/lib/api-helpers";
import { redirect } from "next/navigation";

// This layout wraps /dashboard, /kds, /floor, and /superadmin — its only job
// is the auth gate. Role-based "send this person to their own app" redirects
// used to live here, keyed off a pathname comparison, but that meant every
// route under this layout (including /kds and /floor themselves) re-ran the
// same redirect check — a role mismatch on /floor would bounce to /floor
// again, looping. That logic now lives in dashboard/layout.tsx, the only
// place it should ever fire from, so /kds and /floor can't loop back into it.
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

  // getStaffRecord only resolves an *active* staff row (see its own comment
  // in lib/api-helpers.ts) — RLS already blocks a deactivated account from
  // reading or writing real tenant data via the JWT's `user_role` claim, so
  // this isn't closing a data leak. What it does do: react to deactivation
  // immediately, rather than waiting for that claim to expire and refresh,
  // and — the actual point of this check — give a real "no access" landing
  // page instead of a dashboard shell with nothing behind it, or (for
  // kitchen/floor) their own board rendering permanently empty with no
  // explanation why.
  //
  // /account-deactivated lives outside this route group entirely (and
  // outside (auth), which redirects any live session straight back to
  // /dashboard) so redirecting here can't loop back into this same check.
  const staff = await getStaffRecord(user.id);
  if (!staff) {
    redirect("/account-deactivated");
  }

  return <>{children}</>;
}
