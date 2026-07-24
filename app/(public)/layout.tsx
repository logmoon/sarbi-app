import { menuFontVariables } from "@/lib/fonts";

// Scoped to the customer-facing menu only (this route group), not the
// admin dashboard — so the admin bundle never pays for fonts a tenant's
// theme might not even use. See lib/fonts.ts for why these three (and not
// "modern", which reuses the already-global --font-inter) are loaded here.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={menuFontVariables}>{children}</div>;
}
