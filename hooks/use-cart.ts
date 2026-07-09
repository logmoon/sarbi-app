"use client";

import { useState, useCallback } from "react";

export type CartItem = {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (item: { item_id: string; name: string; price: number; notes?: string }, quantity?: number) => {
      const qty = quantity ?? 1;
      setItems((prev) => {
        const existing = prev.find((i) => i.item_id === item.item_id);
        if (existing && !item.notes && quantity === undefined) {
          return prev.map((i) =>
            i.item_id === item.item_id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [
          ...prev,
          { ...item, quantity: qty, notes: item.notes ?? "" },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.item_id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.item_id !== itemId));
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.item_id === itemId ? { ...i, quantity } : i))
      );
    },
    []
  );

  const updateNotes = useCallback((itemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.item_id === itemId ? { ...i, notes } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    itemCount,
    total,
  };
}
