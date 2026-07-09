"use client";

import { Card } from "@/components/ui/card";
import { formatItemPrice, cn } from "@/lib/utils";
import { type MenuItem } from "@/hooks/use-menu";
import { type Locale } from "@/hooks/use-language";

type MenuItemCardProps = {
  item: MenuItem;
  locale: Locale;
  onAdd: (item: { item_id: string; name: string; price: number }) => void;
  onClick: (item: MenuItem) => void;
};

export function MenuItemCard({
  item,
  locale,
  onAdd,
  onClick,
}: MenuItemCardProps) {
  const name = item.name[locale] ?? item.name["fr"] ?? item.name["en"] ?? "";
  const desc =
    item.description?.[locale] ??
    item.description?.["fr"] ??
    item.description?.["en"] ??
    "";

  return (
    <Card
      className={cn(
        "flex cursor-pointer gap-3 transition-shadow hover:shadow-md",
        !item.is_available && "opacity-60"
      )}
      onClick={() => onClick(item)}
    >
      {item.image_url && (
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <img
            src={item.image_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{name}</h3>
          {desc && (
            <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
              {desc}
            </p>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-accent">
            {formatItemPrice(item.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd({ item_id: item.id, name, price: item.price });
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover"
            aria-label="Add to cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
        </div>
      </div>
    </Card>
  );
}
