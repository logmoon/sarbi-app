"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type SidebarProps = {
  staffLocationId?: string | null;
};

export function Sidebar({ staffLocationId }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useLanguage();

  const navItems = [
    {
      href: "/dashboard/menu",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18v18H3z" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      href: "/dashboard/tables",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      href: "/dashboard/orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      href: "/dashboard/staff",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      href: "/dashboard/analytics",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      href: "/dashboard/settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ),
    },
  ];

  const staffItems: { href: string; labelKey: string; icon: React.ReactNode }[] = [];
  if (staffLocationId) {
    staffItems.push({
      href: `/kds/${staffLocationId}`,
      labelKey: "nav.kds",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    });
    staffItems.push({
      href: `/floor/${staffLocationId}`,
      labelKey: "nav.floor",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    });
  }

  const navLabels: Record<string, string> = {
    "/dashboard/menu": t(locale, "nav.menu"),
    "/dashboard/tables": t(locale, "nav.tables"),
    "/dashboard/orders": t(locale, "nav.orders"),
    "/dashboard/staff": t(locale, "nav.staff"),
    "/dashboard/analytics": t(locale, "nav.analytics"),
    "/dashboard/settings": t(locale, "nav.settings"),
  };

  const builtRoutes = ["/dashboard/menu", "/dashboard/tables"];

  return (
    <>
      <button
        className="fixed start-4 top-3 z-40 rounded-sm p-2 text-text-secondary hover:bg-background lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t(locale, "nav.toggleMenu")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-30 flex w-60 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 rtl:lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/dashboard" className="text-lg font-bold text-accent">
            {t(locale, "auth.wordmark")}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const isPlaceholder = !builtRoutes.includes(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-white"
                        : "text-text-secondary hover:bg-background hover:text-text-primary"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{navLabels[item.href]}</span>
                    {isPlaceholder && !isActive && (
                      <span className="ms-auto text-xs text-text-muted">
                        {t(locale, "common.soon")}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {staffItems.length > 0 && (
            <>
              <div className="my-3 border-t border-border" />
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {t(locale, "nav.staffScreens")}
              </p>
              <ul className="space-y-1">
                {staffItems.map((item) => {
                  const isActive = pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
                  const isBuilt = item.href.startsWith("/kds/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent text-white"
                            : "text-text-secondary hover:bg-background hover:text-text-primary"
                        )}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span>{t(locale, item.labelKey)}</span>
                        {!isBuilt && !isActive && (
                          <span className="ms-auto text-xs text-text-muted">
                            {t(locale, "common.soon")}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
