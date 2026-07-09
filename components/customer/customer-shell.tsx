"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useSession } from "@/hooks/use-session";
import { useCart } from "@/hooks/use-cart";
import { useMenu, type MenuItem } from "@/hooks/use-menu";
import { LanguageToggle } from "@/components/customer/language-toggle";
import { NamePromptModal } from "@/components/customer/name-prompt-modal";
import { AreYouWithModal } from "@/components/customer/are-you-with-modal";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { MenuItemCard } from "@/components/customer/menu-item-card";
import { ItemDetailModal } from "@/components/customer/item-detail-modal";
import { CartDrawer } from "@/components/customer/cart-drawer";
import { OrderConfirmation } from "@/components/customer/order-confirmation";
import { ActionButtons } from "@/components/customer/action-buttons";

type CustomerShellProps = {
  tenantSlug: string;
  publicCode: string;
  tenantName: string;
  tenantLogo: string | null;
  tenantPlan: string;
  brandColors: Record<string, string>;
};

export function CustomerShell({
  tenantSlug,
  publicCode,
  tenantName,
  tenantLogo,
  tenantPlan,
  brandColors,
}: CustomerShellProps) {
  const { locale, changeLocale } = useLanguage();
  const session = useSession(publicCode);
  const cart = useCart();
  const { categories, loading: menuLoading } = useMenu(tenantSlug);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showAreYouWith, setShowAreYouWith] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const canOrder = tenantPlan !== "starter";
  const initialized = useRef(false);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (!canOrder || initialized.current) return;
    initialized.current = true;
    const init = async () => {
      const restored = await session.restoreSession();
      if (restored) return;
      const activeSess = await session.checkForActiveSession();
      if (activeSess) {
        setShowAreYouWith(true);
      } else {
        setShowNamePrompt(true);
      }
    };
    init();
  }, [canOrder, session]);

  const handleNameConfirm = useCallback(
    async (name: string) => {
      setShowNamePrompt(false);
      await session.createSession(name);
    },
    [session]
  );

  const handleJoinSession = useCallback(
    async () => {
      setShowAreYouWith(false);
      await session.joinSession();
    },
    [session]
  );

  const handleDeclineSession = useCallback(() => {
    setShowAreYouWith(false);
    session.declineSession();
  }, [session]);

  const handlePlaceOrder = useCallback(
    async (orderNotes: string) => {
      if (!session.session || placingOrder) return;
      setPlacingOrder(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: session.session.session_id,
            items: cart.items.map((i) => ({
              item_id: i.item_id,
              quantity: i.quantity,
              notes: i.notes || undefined,
            })),
            notes: orderNotes || undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.code === "ITEMS_UNAVAILABLE") {
            alert("Some items are no longer available. Please refresh and try again.");
          } else if (json.code === "SESSION_INACTIVE") {
            alert("Your session has ended. Please scan the QR code again.");
            session.endSession();
          } else {
            alert(json.error || "Failed to place order");
          }
          return;
        }
        cart.clearCart();
        setShowConfirmation(true);
      } catch {
        alert("Failed to place order. Please try again.");
      } finally {
        setPlacingOrder(false);
      }
    },
    [session, cart, placingOrder]
  );

  const handleCallWaiter = useCallback(async () => {
    if (!session.session) return;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session.session.session_id,
        type: "waiter_called",
      }),
    });
    if (!res.ok) throw new Error("Failed");
  }, [session]);

  const handleRequestBill = useCallback(async () => {
    if (!session.session) return;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session.session.session_id,
        type: "bill_requested",
      }),
    });
    if (!res.ok) throw new Error("Failed");
  }, [session]);

  const filteredCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : [];

  const labels = {
    ar: {
      nameTitle: "ما اسمك؟",
      namePlaceholder: "أدخل اسمك",
      nameSubmit: "دخول",
    },
    fr: {
      nameTitle: "Quel est votre nom ?",
      namePlaceholder: "Entrez votre nom",
      nameSubmit: "Entrer",
    },
    en: {
      nameTitle: "What's your name?",
      namePlaceholder: "Enter your name",
      nameSubmit: "Enter",
    },
  };

  const l = labels[locale] ?? labels["fr"];

  const brandVars = Object.fromEntries(
    Object.entries(brandColors).map(([key, val]) => [`--color-${key}`, val])
  );

  return (
    <div className="min-h-screen bg-background" style={brandVars as React.CSSProperties}>
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {tenantLogo && (
              <img
                src={tenantLogo}
                alt={tenantName}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <h1 className="text-base font-semibold text-text-primary">
              {tenantName}
            </h1>
          </div>
          <LanguageToggle locale={locale} onChange={changeLocale} />
        </div>
      </header>

      {menuLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <p className="text-lg font-semibold text-text-primary">
            Menu not available
          </p>
          <p className="text-sm text-text-secondary">
            This restaurant has not added any items yet.
          </p>
        </div>
      ) : (
        <>
          <CategoryTabs
            categories={categories}
            activeId={activeCategory}
            onSelect={setActiveCategory}
            locale={locale}
          />

          <div className="mx-auto max-w-2xl px-4 py-4">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="mb-6">
                <div className="space-y-3">
                  {cat.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      locale={locale}
        onAdd={cart.addItem}
                      onClick={setSelectedItem}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {canOrder && (
            <>
              <CartDrawer
                items={cart.items}
                itemCount={cart.itemCount}
                total={cart.total}
                onUpdateQuantity={cart.updateQuantity}
                onRemoveItem={cart.removeItem}
                onClear={cart.clearCart}
                onPlaceOrder={handlePlaceOrder}
                placingOrder={placingOrder}
              />

              <ActionButtons
                onCallWaiter={handleCallWaiter}
                onRequestBill={handleRequestBill}
                hasSession={!!session.session}
              />
            </>
          )}
        </>
      )}

      <NamePromptModal
        open={showNamePrompt && canOrder}
        title={l.nameTitle}
        placeholder={l.namePlaceholder}
        submitLabel={l.nameSubmit}
        onConfirm={handleNameConfirm}
      />

      {session.existingSession && (
        <AreYouWithModal
          open={showAreYouWith && canOrder}
          customerName={session.existingSession.customer_name ?? "someone"}
          onYes={handleJoinSession}
          onNo={handleDeclineSession}
        />
      )}

      <ItemDetailModal
        item={selectedItem}
        locale={locale}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAdd={cart.addItem}
      />

      <OrderConfirmation
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      />

      <div className="h-24" />
    </div>
  );
}
