"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatItemPrice, cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { type CartItem } from "@/hooks/use-cart";
type CartDrawerProps = {
  items: CartItem[];
  itemCount: number;
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClear: () => void;
  onPlaceOrder: (notes: string) => void;
  placingOrder: boolean;
};

export function CartDrawer({
  items,
  itemCount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  onPlaceOrder,
  placingOrder,
}: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const { locale } = useLanguage();

  function handlePlaceOrder() {
    onPlaceOrder(orderNotes);
  }

  return (
    <>
      {itemCount > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-white shadow-lg hover:bg-accent-hover">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {itemCount}
            </span>
            <span className="text-sm font-semibold">{t(locale, "cart.viewCart", { count: itemCount })}</span>
            <span className="text-sm font-semibold">
              {formatItemPrice(total, locale)}
            </span>
          </div>
        </button>
      )}

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-xl bg-surface shadow-lg transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "80vh" }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold text-text-primary">
            {t(locale, "cart.titleCount", { count: itemCount })}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="text-xs text-status-error hover:underline"
            >
              {t(locale, "common.clear")}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm p-1 text-text-muted hover:bg-background"
              aria-label={t(locale, "common.close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              {t(locale, "cart.empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((cartItem) => (
                <div
                  key={cartItem.item_id}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {cartItem.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatItemPrice(cartItem.price, locale)} {t(locale, "cart.each")}
                    </p>
                    {cartItem.notes && (
                      <p className="mt-0.5 text-xs italic text-text-secondary">
                        {cartItem.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            cartItem.item_id,
                            cartItem.quantity - 1
                          )
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-secondary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className="min-w-[20px] text-center text-sm text-text-primary">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            cartItem.item_id,
                            cartItem.quantity + 1
                          )
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-text-secondary"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(cartItem.item_id)}
                      className="p-1 text-text-muted hover:text-status-error"
                      aria-label={t(locale, "cart.removeItem")}
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
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <div className="mb-2">
              <input
                placeholder={t(locale, "cart.notes")}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">
                {t(locale, "cart.total")} {formatItemPrice(total, locale)}
              </p>
              <Button onClick={handlePlaceOrder} disabled={placingOrder}>
                {placingOrder ? t(locale, "cart.placingOrder") : t(locale, "cart.placeOrder")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
