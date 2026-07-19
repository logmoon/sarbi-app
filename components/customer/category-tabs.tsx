"use client";

import { cn } from "@/lib/utils";
import { type MenuCategory } from "@/hooks/use-menu";
import { type Locale } from "@/lib/i18n";

type CategoryTabsProps = {
  categories: MenuCategory[];
  activeId: string | null;
  onSelect: (id: string) => void;
  locale: Locale;
};

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
  locale,
}: CategoryTabsProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeId === cat.id
                ? "bg-accent text-white"
                : "bg-surface text-text-secondary hover:text-text-primary border border-border"
            )}
          >
            {cat.name[locale] ?? cat.name["fr"] ?? cat.name["en"] ?? ""}
          </button>
        ))}
      </div>
    </div>
  );
}
