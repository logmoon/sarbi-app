# Memory — Floor Staff App (Task 09)

_Last updated: 2026-07-19_

---

## What was built

### 09. Floor Staff App
Mobile-optimized `/floor/[locationId]` with two tabs.

**Live Feed tab** — merged real-time list of 5 card types, sorted oldest-first:
- `ORDER READY` (from `orders.status = "ready"`) → "Confirm Delivered" button → PATCH order to delivered
- `ORDER CANCELLED` (from `orders.status = "cancelled"`) → "Acknowledge" button → client-side dismiss (cancelled is terminal)
- `WAITER CALLED` (from `table_events.type = "waiter_called"`) → "Resolve" button → PATCH event to resolved
- `BILL REQUESTED` (from `table_events.type = "bill_requested"`) → "Resolve" button → shows running total from event metadata
- `CHECK TABLE` (from `table_events.type = "check_needed"`) → "Acknowledge" button → PATCH event to resolved

**Session History tab** — active sessions list, expandable per-session card showing:
- Table label, customer name, elapsed time, running total
- Order list with status badges, items, per-order subtotals
- Clear Table button (reuses existing `DELETE /api/sessions/[id]`)

**Components** (`components/floor/`):
- `floor-board.tsx` — main shell (h-screen, header, tabs, content area, mute toggle)
- `live-feed.tsx` — merges events + feed-orders, renders FeedCards
- `feed-card.tsx` — discriminated union `FeedItem` for 5 card types, status-border convention
- `session-tab.tsx` — expandable session cards, ConfirmDialog for Clear Table

**Hooks** (`hooks/`):
- `use-floor-events.ts` — fetches pending events, Realtime INSERT → refetch, resolveEvent (PATCH)
- `use-floor-orders.ts` — fetches all orders with `?all=true`, Realtime UPDATE, confirmDelivered (PATCH)
- `use-floor-sessions.ts` — fetches active sessions + all orders, Realtime on both, clearTable (DELETE)
- `use-floor-sound.ts` — Web Audio API, single triangle-wave pulse (660Hz), distinct from KDS chime, mute persisted to localStorage

**API routes**:
- New: `GET /api/events?location_id=X` — staff-authenticated, returns pending events with joins
- New: `PATCH /api/events/[id]` — resolves event (status=resolved, resolved_at=now)
- New: `GET /api/sessions?location_id=X` — staff-authenticated, returns active sessions with table label
- Modified: `PATCH /api/orders/[id]` — added `ready: ["delivered"]` to ALLOWED_TRANSITIONS
- Modified: `GET /api/orders?location_id=X&all=true` — new `?all=true` param skips KDS status filter

**Migration**: `017_floor_update_policy.sql` — adds `floor_update` RLS policy on orders (scoped to staff's location_id, matching kitchen_update pattern)

**Schema fix**: `lib/validators.ts` `updateOrderStatusSchema` — added `z.object({ status: z.literal("delivered") })` to the discriminated union (was missing — would have rejected floor confirmDelivered with 400)

**Sidebar**: removed "Soon" badge from floor link in `components/layout/sidebar.tsx` by extending the `isBuilt` check to include `/floor/`

**i18n**: ~25 new `floor.*` keys (AR/FR/EN). Reused existing `kds.cancelReason.*` keys for translating cancellation reason codes in the feed.

---

## Decisions made

- **Cancelled order dismiss is client-side only** — cancelled is a terminal state, no DB transition. On page reload, only cancelled orders from the last 30 min reappear (filtered in `floor-board.tsx` `feedOrders` memo). No new DB state needed.
- **`getStaffTenantAndLocation()` null locationId bug is pre-existing** — affects KDS too. The page-level guard (which checks `staffLocationId !== location.id` only when locationId is not null) lets owners and multi-location managers through. The API-level guard fails them (returns 403) but only matters for non-page-level access. Out of scope for Task 09.
- **Feed sort is oldest-first (ascending created_at)** — older items are more urgent (waiting longest). Same as KDS queue ordering.
- **Bill requested total comes from `event.metadata.running_total`** — already populated by the customer POST /api/events route at bill-request time, no extra query needed in floor.
- **Web Audio distinct from KDS** — KDS uses 880/1108 Hz two-note ascending chime (kitchen bell). Floor uses single 660 Hz triangle-wave pulse (notification ping, not bell).
- **Sidebar "Soon" badge check** — `isBuilt = item.href.startsWith("/kds/") || item.href.startsWith("/floor/")` rather than maintaining a separate `builtRoutes` array for staff screens.

---

## Problems solved

- **Overwrote existing `events/route.ts` and `sessions/route.ts`** — created new files at paths that already had POST handlers, deleting them. Caught when user reported `POST /api/sessions 405`. Restored by `git show HEAD:<path>` to get original content, then rewrote with both POST and GET handlers coexisting. Lesson: always `git ls-files` or read existing file before writing a new route handler.
- **`common.clear` i18n key missing** — cart-drawer was using `t(locale, "common.clear")` but the key didn't exist in any locale map. `t()` falls back to returning the key itself, so customer saw literal "common.clear" on the Clear button. Added AR/F/EN translations.
- **Floor prices were `/1000` off** — used `(total / 1000).toFixed(3)` but prices in `order_items` are already in TND (decimal 10,3), not millimes. Switched to existing `formatItemPrice()` from `lib/utils.ts` (which takes the value as-is).
- **Cancellation reason showed raw DB code** — `cancelled_reason` column stores `out_of_stock` / `kitchen_error` / `other` (DB enum), but feed-card was rendering the raw value. Added `translateCancelReason()` function in feed-card.tsx that maps to existing `kds.cancelReason.*` i18n keys. Free-text reason notes (when reason_code is "other") pass through unchanged via the default case.
- **`updateOrderStatusSchema` missing "delivered"** — extending the orders PATCH state machine to allow `ready → delivered` wasn't enough; the Zod validator's discriminated union also needed the new status. Caught by reviewer.

---

## Current state

- Phase 1–2: Complete
- Phase 3 (Customer Product): 06, 06b, 06c done
- Phase 4 (Operations): 07, 08, 09 done — **complete**
- Phase 5 (Management): Not started

Committed to main as `418ea90`. Migrations 015/016/017 still need to be applied to the developer's Supabase project and pushed to `origin/main` — no push happened this session.

---

## Next session starts with

10. Admin Dashboard (Live Orders + Analytics) — live read-only orders view, today's stats, charts, top items, peak hours heatmap, staff management, tenant settings.

---

## Open questions

- (Carried over) Should `check_needed` events ever auto-resolve, or only via explicit staff action? Not urgent.
- The pre-existing `getStaffTenantAndLocation()` null-locationId bug means owners cannot use the floor app's API endpoints directly (only via browser, where the page-level guard lets them through). Worth a follow-up session to widen the API guard to allow tenant-wide access for owners/location-managers-without-location.
- Migrations 015/016/017 + KDS + floor + i18n work still need to be tested against the developer's real Supabase project and pushed — nothing has been pushed to `origin/main` this session.
