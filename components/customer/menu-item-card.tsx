"use client";

import { Card } from "@/components/ui/card";
import { formatItemPrice, cn } from "@/lib/utils";
import { type MenuItem } from "@/hooks/use-menu";
import { t, type Locale } from "@/lib/i18n";
import { type LayoutPreset } from "@/lib/brand";

type MenuItemCardProps = {
  item: MenuItem;
  locale: Locale;
  layout?: LayoutPreset;
  onAdd: (item: { item_id: string; name: string; price: number }) => void;
  onClick: (item: MenuItem) => void;
};

function AddButton({
  onAdd,
  size = "md",
}: {
  onAdd: (e: React.MouseEvent) => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onAdd}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover",
        size === "md" ? "h-8 w-8" : "h-7 w-7"
      )}
      aria-label="Add to cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size === "md" ? 16 : 14}
        height={size === "md" ? 16 : 14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}

// The current/default look: photo on top, text below, in a 2-up grid.
// Good general-purpose default, especially with photography for every item.
function GridCard({ item, locale, onAdd, onClick }: Omit<MenuItemCardProps, "layout">) {
  const name = item.name[locale] ?? item.name["fr"] ?? item.name["en"] ?? "";
  const desc =
    item.description?.[locale] ??
    item.description?.["fr"] ??
    item.description?.["en"] ??
    "";

  return (
    <Card
      className={cn(
        "flex min-h-[230px] cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md",
        !item.is_available && "opacity-60"
      )}
      onClick={() => onClick(item)}
    >
      {item.image_url && (
        <div className="h-28 w-full flex-shrink-0 overflow-hidden">
          <img
            src={item.image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <h3 className="font-heading text-sm font-semibold text-text-primary">
            {name}
          </h3>
          {desc && (
            <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
              {desc}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-accent">
            {formatItemPrice(item.price, locale)}
          </span>
          <AddButton
            onAdd={(e) => {
              e.stopPropagation();
              onAdd({ item_id: item.id, name, price: item.price });
            }}
          />
        </div>
      </div>
    </Card>
  );
}

// Dense single-column rows, no room lost to photography — good for large
// text-heavy menus or tenants without item photos.
function CompactCard({ item, locale, onAdd, onClick }: Omit<MenuItemCardProps, "layout">) {
  const name = item.name[locale] ?? item.name["fr"] ?? item.name["en"] ?? "";
  const desc =
    item.description?.[locale] ??
    item.description?.["fr"] ??
    item.description?.["en"] ??
    "";

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-3 border-b border-border bg-surface px-3 py-2.5 last:border-b-0",
        !item.is_available && "opacity-60"
      )}
      onClick={() => onClick(item)}
    >
      {item.image_url && (
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm">
          <img
            src={item.image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-heading truncate text-sm font-semibold text-text-primary">
          {name}
        </h3>
        {desc && (
          <p className="truncate text-xs text-text-secondary">{desc}</p>
        )}
      </div>
      <span className="shrink-0 text-sm font-semibold text-accent">
        {formatItemPrice(item.price, locale)}
      </span>
      <AddButton
        size="sm"
        onAdd={(e) => {
          e.stopPropagation();
          onAdd({ item_id: item.id, name, price: item.price });
        }}
      />
    </div>
  );
}

// One column, large photography, more breathing room — an editorial feel
// for menus built around strong food photography.
function MagazineCard({ item, locale, onAdd, onClick }: Omit<MenuItemCardProps, "layout">) {
  const name = item.name[locale] ?? item.name["fr"] ?? item.name["en"] ?? "";
  const desc =
    item.description?.[locale] ??
    item.description?.["fr"] ??
    item.description?.["en"] ??
    "";

  return (
    <Card
      className={cn(
        "flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md",
        !item.is_available && "opacity-60"
      )}
      onClick={() => onClick(item)}
    >
      {item.image_url && (
        <div className="aspect-[16/10] w-full flex-shrink-0 overflow-hidden">
          <img
            src={item.image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-base font-semibold text-text-primary">
            {name}
          </h3>
          <span className="shrink-0 text-base font-semibold text-accent">
            {formatItemPrice(item.price, locale)}
          </span>
        </div>
        {desc && (
          <p className="line-clamp-3 text-sm text-text-secondary">{desc}</p>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd({ item_id: item.id, name, price: item.price });
          }}
          className="mt-1 self-start rounded-sm bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover"
        >
          {t(locale, "customer.addToOrder")}
        </button>
      </div>
    </Card>
  );
}

export function MenuItemCard({ layout = "grid", ...props }: MenuItemCardProps) {
  if (layout === "compact") return <CompactCard {...props} />;
  if (layout === "magazine") return <MagazineCard {...props} />;
  return <GridCard {...props} />;
}
