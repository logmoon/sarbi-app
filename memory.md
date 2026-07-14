# Memory — Customer Menu (Browsing, Cart, Ordering)

_Last updated: 2026-07-09_

---

## What was built

- **Customer menu page** (`app/(public)/[tenantSlug]/table/[publicCode]/page.tsx`) — SSR page that resolves QR code → table → tenant, passes data to client shell, handles inactive table state
- **11 client components** under `components/customer/`: `customer-shell.tsx` (orchestrator), `language-toggle.tsx`, `name-prompt-modal.tsx`, `are-you-with-modal.tsx`, `category-tabs.tsx`, `menu-item-card.tsx`, `item-detail-modal.tsx`, `cart-drawer.tsx`, `order-confirmation.tsx`, `action-buttons.tsx`
- **4 hooks:** `use-language.ts` (localStorage + browser locale, RTL for Arabic), `use-cart.ts` (client-side cart state), `use-session.ts` (cookie-based session restore, create, join with action-based API), `use-menu.ts` (fetch categories + items)
- **4 API routes:**
  - `app/api/menu/public/route.ts` — GET public menu by tenant slug
  - `app/api/sessions/route.ts` — POST with action-based flow (restore, check_table, join, create)
  - `app/api/orders/route.ts` — POST with item availability re-validation, price snapshot, plan check, session timeout enforcement
  - `app/api/events/route.ts` — POST with Zod validation, bill_requested computes running total
- **Session cookie utility** (`lib/session-cookie.ts`) — get/set/clear session cookie with configurable expiry
- **DB migration** (`supabase/migrations/012_customer_menu_functions.sql`) — `get_active_session` and `get_location_timeout` helpers
- **Utilities updated** — `lib/utils.ts` (added `formatItemPrice`), `lib/validators.ts` (added session + event schemas), `components/ui/card.tsx` (added onClick), `components/ui/input.tsx` (added onKeyDown)
- **Docs updated** — `context/progress-tracker.md`, `context/build-plan.md` (added 06b UX polish task), `context/ui-registry.md` (5 new component entries)

## Decisions made

- Service-role admin client for all customer writes (not anon RLS) — API layer is the gatekeeper
- Session created on first scan regardless of plan (starter = browse only, no ordering UI)
- Unavailable items → reject entire order (409), not partial acceptance
- Price snapshots re-read from DB at order time, not trusted from cart
- Language stored in localStorage, default to browser locale, RTL for Arabic
- Cart is purely client-side React state — no DB table
- Sessions API uses explicit `action` field (restore / check_table / join / create) instead of overloading flags
- Session timeout enforced server-side at order/event creation time
- Brand colors injected as CSS variables from `tenant.brand_colors`

## Problems solved

- **Brand colors not applied** — review found `brandColors` prop was destructured but silently dropped. Fixed by injecting as `style` on wrapper div.
- **Session cookie restore broken** — `checkExistingSession` sent empty `customer_name` but Zod required `min(1)`. Fixed by refactoring to action-based API with dedicated `restore` action.
- **Item notes lost** — `useCart.addItem` didn't accept notes. `ItemDetailModal` passed notes as second arg that was ignored. Fixed by making `addItem` accept optional notes + quantity params.
- **Events API missing Zod validation** — was manually validating. Fixed by using `createTableEventSchema` and including `check_needed` type.
- **ActionButtons silent failures** — caught errors without feedback. Fixed by showing error toast on failure.
- **Session timeout not enforced** — orders/events only checked `status === 'active'`, never checked elapsed time against location timeout. Fixed by adding timeout check.

## Current state

Step 06 complete. Customer can:
- Scan QR code → land on themed menu page in browser language (fallback French)
- Enter name (soft identity prompt), see "Are you with [name]?" on active session
- Browse menu by category, view item details, add to cart
- Open cart drawer, adjust quantities, add notes, place order
- Call waiter / request bill (icon-only buttons)
- Toggle language AR/FR/EN with RTL for Arabic
- Starter tier tenants see browse-only (no ordering UI)

## Next session starts with

**Step 06b — Customer Menu UX Polish.** Full-scope session to fix: card layout (vertical, uniform, pinned + button), 2-column grid, My Orders tab with live Realtime status, server-deduped waiter call/bill request events (persist across devices and reloads), bill request hidden until orders exist, customer name in header, button text labels.

## Open questions

- None from this session.
