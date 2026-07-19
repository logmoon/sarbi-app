"use client";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

type ItemCardProps<T extends { id: string; name: Record<string, string>; price: number; image_url: string | null; is_available: boolean }> = {
  item: T;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  dragHandle?: React.ReactNode;
};

export function ItemCard<T extends { id: string; name: Record<string, string>; price: number; image_url: string | null; is_available: boolean }>({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
  dragHandle,
}: ItemCardProps<T>) {
  const { locale } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-sm border border-border bg-surface p-3 transition-colors",
        !item.is_available && "opacity-50"
      )}
    >
      {dragHandle && <div className="shrink-0">{dragHandle}</div>}

      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-background">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name.en}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {item.name.en}
        </p>
        <p className="text-xs text-text-muted">
          {item.name.fr} / {item.name.ar}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold text-text-primary">
        {formatPrice(item.price * 1000)}
      </p>

      <Switch
        checked={item.is_available}
        onChange={(checked) => onToggleAvailability(item.id, checked)}
      />

      <Button
        variant="ghost"
        className="h-8 w-8 min-w-0 p-0"
        onClick={() => onEdit(item)}
        aria-label={`${t(locale, "common.edit")} ${item.name.en}`}
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
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Button>

      <Button
        variant="ghost"
        className="h-8 w-8 min-w-0 p-0 text-status-error hover:text-status-error"
        onClick={() => onDelete(item.id)}
        aria-label={`${t(locale, "common.delete")} ${item.name.en}`}
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
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </Button>
    </div>
  );
}
