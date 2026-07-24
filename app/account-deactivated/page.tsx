"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

// Deliberately outside the (auth) and (platform) route groups:
// - (auth)/layout.tsx redirects any request with a live session to
//   /dashboard, which would bounce this page right back before it could
//   sign the session out.
// - (platform)/layout.tsx is what sent the user here in the first place
//   (no resolvable active staff record) — landing back inside it would
//   just redirect here again.
// This page has to actually end the session itself (client-side, since a
// Server Component/layout can't write cookies during render) before it's
// safe to send the person anywhere else.
export default function AccountDeactivatedPage(): React.ReactNode {
  const router = useRouter();
  const { locale } = useLanguage();
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.signOut().finally(() => {
      if (!cancelled) setSignedOut(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6">
      <Card className="w-full max-w-[400px] p-6 text-center sm:p-8">
        <CardContent>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-error/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-status-error"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            {t(locale, "accountDeactivated.title")}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t(locale, "accountDeactivated.description")}
          </p>
          <Button
            className="mt-6 w-full"
            disabled={!signedOut}
            onClick={() => router.push("/login")}
          >
            {signedOut
              ? t(locale, "accountDeactivated.backToLogin")
              : t(locale, "common.loading")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
