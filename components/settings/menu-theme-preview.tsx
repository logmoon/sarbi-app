"use client";

import { useState } from "react";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { MenuItemCard } from "@/components/customer/menu-item-card";
import { themeStyleVars, type MenuTheme } from "@/lib/brand";
import { type MenuCategory } from "@/hooks/use-menu";
import { useLanguage } from "@/hooks/use-language";
import { t } from "@/lib/i18n";

// A plain placeholder "photo" (fork + knife glyph on a neutral tile) so the
// grid/magazine layouts' photo treatment is visible in the preview without
// hotlinking a real image into admin-bundle code.
const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#E5E7EB"/><g stroke="#9CA3AF" stroke-width="8" stroke-linecap="round" fill="none"><line x1="150" y1="105" x2="150" y2="195"/><line x1="133" y1="105" x2="133" y2="150"/><line x1="167" y1="105" x2="167" y2="150"/><path d="M247 105 v42 a14 14 0 0 0 14 14 v34"/></g></svg>'
)}`;

const SAMPLE_CATEGORIES: MenuCategory[] = [
  {
    id: "preview-starters",
    name: { en: "Starters", fr: "Entrées", ar: "المقبلات" },
    sort_order: 0,
    is_available: true,
    items: [
      {
        id: "preview-item-1",
        name: { en: "Grilled Salmon", fr: "Saumon grillé", ar: "سلمون مشوي" },
        description: {
          en: "Lemon butter sauce, seasonal vegetables.",
          fr: "Sauce au beurre citronné, légumes de saison.",
          ar: "صلصة الزبدة بالليمون، خضروات الموسم.",
        },
        price: 24.5,
        image_url: PLACEHOLDER_IMAGE,
        is_available: true,
        sort_order: 0,
      },
      {
        id: "preview-item-2",
        name: { en: "Burrata Salad", fr: "Salade burrata", ar: "سلطة البوراتا" },
        description: {
          en: "Heirloom tomatoes, basil, aged balsamic.",
          fr: "Tomates anciennes, basilic, vieux balsamique.",
          ar: "طماطم موروثة، ريحان، بلسميك معتق.",
        },
        price: 14,
        image_url: PLACEHOLDER_IMAGE,
        is_available: true,
        sort_order: 1,
      },
    ],
  },
  {
    id: "preview-mains",
    name: { en: "Mains", fr: "Plats", ar: "الأطباق الرئيسية" },
    sort_order: 1,
    is_available: true,
    items: [
      {
        id: "preview-item-3",
        name: { en: "Slow-braised Lamb", fr: "Agneau braisé", ar: "لحم ضأن مطهو ببطء" },
        description: {
          en: "With roasted root vegetables and red wine jus.",
          fr: "Légumes racines rôtis et jus au vin rouge.",
          ar: "مع خضروات جذرية مشوية وصلصة النبيذ الأحمر.",
        },
        price: 28,
        image_url: PLACEHOLDER_IMAGE,
        is_available: true,
        sort_order: 0,
      },
    ],
  },
];

export function MenuThemePreview({
  theme,
  tenantName,
  logoUrl,
  coverUrl,
}: {
  theme: MenuTheme;
  tenantName: string;
  logoUrl: string | null;
  coverUrl: string | null;
}) {
  const { locale } = useLanguage();
  const [activeId, setActiveId] = useState(SAMPLE_CATEGORIES[0].id);
  const vars = themeStyleVars(theme);
  const active = SAMPLE_CATEGORIES.find((c) => c.id === activeId) ?? SAMPLE_CATEGORIES[0];
  const layout = theme.layout ?? "grid";

  return (
    <div
      className="overflow-hidden rounded-sm border border-border bg-background"
      style={vars as React.CSSProperties}
    >
      {coverUrl && (
        <div className="h-28 w-full overflow-hidden">
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2.5">
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
        )}
        <span className="font-heading text-sm font-semibold text-text-primary">
          {tenantName || t(locale, "settings.previewTenantNameFallback")}
        </span>
      </div>

      <CategoryTabs
        categories={SAMPLE_CATEGORIES}
        activeId={activeId}
        onSelect={setActiveId}
        locale={locale}
      />

      <div className="p-3">
        <div
          className={
            layout === "compact"
              ? "flex flex-col overflow-hidden rounded-sm border border-border"
              : layout === "magazine"
              ? "flex flex-col gap-3"
              : "grid grid-cols-2 gap-2"
          }
        >
          {active.items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              locale={locale}
              layout={layout}
              onAdd={() => {}}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
