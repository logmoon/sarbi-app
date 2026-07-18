import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// A sparse grid of rounded squares, deliberately irregular — a nod to a QR
// code's module grid without literally drawing one. Very low opacity, purely
// texture behind the card, never competes with it.
function QrMotifBackground(): React.ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-accent"
    >
      <defs>
        <pattern id="qr-motif" width="56" height="56" patternUnits="userSpaceOnUse">
          <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor" />
          <rect x="24" y="4" width="10" height="10" rx="2" fill="currentColor" />
          <rect x="4" y="24" width="10" height="10" rx="2" fill="currentColor" />
          <rect x="34" y="30" width="10" height="10" rx="2" fill="currentColor" />
          <rect x="14" y="40" width="10" height="10" rx="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#qr-motif)" fillOpacity="0.05" />
    </svg>
  );
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6">
      <QrMotifBackground />

      <div className="relative w-full max-w-[400px] motion-safe:animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="text-3xl font-bold tracking-tight text-accent">Sarbi</span>
          <span className="mt-1.5 text-sm text-text-secondary">
            Digital menus &amp; table ordering
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
