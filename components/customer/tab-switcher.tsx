"use client";

import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

export type MenuTab = "menu" | "orders";

type TabSwitcherProps = {
  activeTab: MenuTab;
  onTabChange: (tab: MenuTab) => void;
};

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  const { locale } = useLanguage();

  return (
    <div className="sticky top-[57px] z-20 border-b border-border bg-background">
      <div className="flex gap-1 px-4 py-2">
        <button
          onClick={() => onTabChange("menu")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeTab === "menu"
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {t(locale, "customer.tab.menu")}
        </button>
        <button
          onClick={() => onTabChange("orders")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeTab === "orders"
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {t(locale, "customer.tab.myOrders")}
        </button>
      </div>
    </div>
  );
}
