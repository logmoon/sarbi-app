"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatItemPrice } from "@/lib/utils";
import { type MenuItem } from "@/hooks/use-menu";
import { type Locale } from "@/hooks/use-language";

type ItemDetailModalProps = {
  item: MenuItem | null;
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onAdd: (item: { item_id: string; name: string; price: number; notes?: string }, quantity?: number) => void;
};

export function ItemDetailModal({
  item,
  locale,
  open,
  onClose,
  onAdd,
}: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  if (!item) return null;
  const safeItem = item;

  const name =
    safeItem.name[locale] ?? safeItem.name["fr"] ?? safeItem.name["en"] ?? "";
  const desc =
    safeItem.description?.[locale] ??
    safeItem.description?.["fr"] ??
    safeItem.description?.["en"] ??
    "";

  function handleAdd() {
    onAdd(
      { item_id: safeItem.id, name, price: safeItem.price, notes: notes || undefined },
      quantity
    );
    setQuantity(1);
    setNotes("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={name}>
      {item.image_url && (
        <div className="mb-4 overflow-hidden rounded-md">
          <img
            src={item.image_url}
            alt={name}
            className="h-48 w-full object-cover"
          />
        </div>
      )}
      {desc && (
        <p className="mb-4 text-sm text-text-secondary">{desc}</p>
      )}
      <p className="mb-4 text-lg font-semibold text-accent">
        {formatItemPrice(item.price)}
      </p>

      <div className="mb-4">
        <Input
          label="Notes"
          placeholder="Any special requests?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-text-secondary">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-background"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="min-w-[24px] text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-background"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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

      <DialogActions>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleAdd}>
          Add to Cart - {formatItemPrice(item.price * quantity)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
