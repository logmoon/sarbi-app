"use client";

import { useState, useEffect } from "react";

export type MenuItem = {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
};

export type MenuCategory = {
  id: string;
  name: Record<string, string>;
  sort_order: number;
  is_available: boolean;
  items: MenuItem[];
};

export function useMenu(tenantSlug: string) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantSlug) return;
    setLoading(true);
    fetch(`/api/menu/public?slug=${encodeURIComponent(tenantSlug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setCategories(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  return { categories, loading };
}
