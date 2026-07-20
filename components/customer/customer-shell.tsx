"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useSession } from "@/hooks/use-session";
import { useCart } from "@/hooks/use-cart";
import { useMenu, type MenuItem } from "@/hooks/use-menu";
import { useOrders } from "@/hooks/use-orders";
import { useEvents } from "@/hooks/use-events";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/customer/language-toggle";
import { NamePromptModal } from "@/components/customer/name-prompt-modal";
import { AreYouWithModal } from "@/components/customer/are-you-with-modal";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { TabSwitcher, type MenuTab } from "@/components/customer/tab-switcher";
import { MenuItemCard } from "@/components/customer/menu-item-card";
import { MyOrdersTab } from "@/components/customer/my-orders-tab";
import { ItemDetailModal } from "@/components/customer/item-detail-modal";
import { CartDrawer } from "@/components/customer/cart-drawer";
import { OrderConfirmation } from "@/components/customer/order-confirmation";
import { ActionButtons } from "@/components/customer/action-buttons";
import { FullScreenMessage } from "@/components/customer/full-screen-message";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const { orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useOrders(
    session.session?.session_id ?? null
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showAreYouWith, setShowAreYouWith] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConflictConfirm, setShowConflictConfirm] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuTab>("menu");
  // True once the customer has declined "Are you with [name]?" — they are
  // deliberately not joined into the existing session (see declineSession),
  // so there is nothing for them to do here until staff clears the table.
  const [blocked, setBlocked] = useState(false);
  const { waiterPending, billPending } = useEvents(
    session.session?.session_id ?? null
  );

  const canOrder = tenantPlan !== "starter";
  const initialized = useRef(false);
  const hasOrders = orders.some((o) => o.status === "delivered");

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    initialized.current = false;
    setBlocked(false);
  }, [publicCode]);

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

  const handleJoinSession = useCallback(async () => {
    setShowAreYouWith(false);
    await session.joinSession();
  }, [session]);

  const handleDeclineSession = useCallback(async () => {
    setShowAreYouWith(false);
    setShowConflictConfirm(true);
  }, []);

  const handleConflictConfirmed = useCallback(async () => {
    setShowConflictConfirm(false);
    await session.declineSession();
    setBlocked(true);
  }, [session]);

  const handleConflictCanceled = useCallback(() => {
    setShowConflictConfirm(false);
    setShowAreYouWith(true);
  }, []);

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
            alert(t(locale, "customer.itemsUnavailable"));
          } else if (json.code === "SESSION_INACTIVE") {
            alert(t(locale, "customer.sessionEnded"));
            session.endSession();
          } else {
            alert(json.error || t(locale, "customer.failedPlaceOrder"));
          }
          return;
        }
        cart.clearCart();
        refetchOrders();
        setShowConfirmation(true);
      } catch {
        alert(t(locale, "customer.failedPlaceOrderRetry"));
      } finally {
        setPlacingOrder(false);
      }
    },
    [session, cart, placingOrder, refetchOrders, locale]
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

  const customerName = session.session?.customer_name;

  const brandVars = Object.fromEntries(
    Object.entries(brandColors).map(([key, val]) => [`--color-${key}`, val])
  );

  if (blocked) {
    return (
      <FullScreenMessage
        title={t(locale, "customer.loading")}
        description={t(locale, "customer.loadingDesc")}
        action={{
          label: t(locale, "customer.tryAgain"),
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background" style={brandVars as React.CSSProperties}>
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {tenantLogo && (
              <img
                src={tenantLogo}
                alt={tenantName}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-base font-semibold text-text-primary">
                {tenantName}
              </h1>
              {customerName && (
                <p className="text-xs text-text-secondary">
                  {t(locale, "customer.hello", { name: customerName })}
                </p>
              )}
            </div>
          </div>
          <LanguageToggle locale={locale} onChange={changeLocale} />
        </div>
      </header>

      {canOrder && (
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {menuLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
          <p className="text-lg font-semibold text-text-primary">
            {t(locale, "customer.menuNotAvailable")}
          </p>
          <p className="text-sm text-text-secondary">
            {t(locale, "customer.menuNotAvailableDesc")}
          </p>
        </div>
      ) : activeTab === "menu" ? (
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
                <div className="grid grid-cols-2 gap-3">
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
        </>
      ) : (
        <MyOrdersTab
          orders={orders}
          loading={ordersLoading}
          error={ordersError}
          sessionId={session.session?.session_id ?? null}
          locale={locale}
        />
      )}

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
            hasOrders={hasOrders}
            waiterPending={waiterPending}
            billPending={billPending}
          />
        </>
      )}

      <NamePromptModal
        open={showNamePrompt && canOrder}
        title={t(locale, "customer.nameTitle")}
        placeholder={t(locale, "customer.namePlaceholder")}
        submitLabel={t(locale, "customer.nameSubmit")}
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

      <ConfirmDialog
        open={showConflictConfirm}
        title={t(locale, "customer.sessionConflictTitle")}
        message={t(locale, "customer.sessionConflictDesc")}
        onConfirm={handleConflictConfirmed}
        onClose={handleConflictCanceled}
        variant="primary"
        confirmLabel={t(locale, "customer.sessionConflictYes")}
      />

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
