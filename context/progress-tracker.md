# Progress Tracker

_Read this at the start of every session before doing anything else. Keep it current as you build — it is a live reference, not a closing checklist. Also auto-injected by the memory hook._

---

## Status

| Phase | Status |
|---|---|
| Phase 1 — Foundation | ✅ Complete |
| Phase 2 — Data Layer | ✅ Complete |
| Phase 3 — Customer Product | ✅ Complete |
| Phase 4 — Operations | ✅ Complete |
| Phase 5 — Management | ✅ Complete |

---

## In Progress

<!-- What is actively being built right now — update as you go -->

---

## Done

- 01. Project Scaffold + Supabase Setup
- 02. Supabase Auth + Role System
- 03. Database Schema + RLS Policies
- 04. Menu CRUD (Admin Dashboard Editor)
- 05. Table Management + QR Code Generation
- 06. Customer Menu (Browsing, Cart, Ordering)
- 06b. Customer Menu UX Polish — Vertical card layout, 2-column grid, My Orders tab with live Realtime, server-deduped event state, text-labeled action buttons, bill request hidden until orders exist, customer name in header
- 06c. App-wide i18n — `lib/i18n.ts` with ~200 flat keys covering AR/FR/EN for every UI string across the entire app (customer menu, KDS, admin dashboard, auth screens, sidebar, tables, menu editor, metadata, time formatting). `t(locale, key, params?)` function with `{name}` interpolation. Server-side locale detection via middleware (`x-locale` header from cookie → Accept-Language fallback). Cookie ↔ localStorage sync in `useLanguage()` hook. All inline label objects removed. 0 build errors/warnings.
- 07. Session Lifecycle + Timeout — built out of order (before 06c) as a bug-fix pass rather than a planned session. Realtime publication + `REPLICA IDENTITY FULL` enabled (was silently no-op-ing before), lazy timeout enforcement on every session lookup (not a cron job), race-safe session creation (partial unique index), "Are you with [name]?" → "No" blocks instead of joining, with **Clear Table** (`DELETE /api/sessions/[id]`, pulled forward from 09) as the resolution path. `context/build-plan.md` and `sarbi-design-doc.md` updated to match.
- 08. Kitchen Display System (KDS) — built out of order (before 06c), at the developer's explicit request. Full-screen dark `/kds/[locationId]`: live queue via `PATCH /api/orders/[id]` (start/ready/cancel-with-reason, one state machine, `cancelled_reason`/`cancelled_by` columns finally used instead of the customer route's `metadata` workaround), Realtime + staff-authenticated `GET /api/orders?location_id=`, client-side fade/removal for `ready`/stale cards, Web Audio chime (30s loop while any `pending` order exists, mute persisted locally, no blocking "enable sound" gate), live color-coded age timer. New dark KDS design tokens added to `ui-tokens.md`/`globals.css`/`tailwind.config.ts`.
  - **Bug fix (blocking, found before building):** `app/(platform)/layout.tsx` read role off `user.app_metadata`, which the `custom_access_token_hook` never populates (it writes `user_role` into the JWT's own claims instead) — kitchen/floor/super_admin were never actually being redirected to their own app. Fixed by reading role from the `staff` table via a new `getStaffRecord()` helper. Also added `x-pathname` header forwarding (in `middleware.ts`) so the redirect doesn't loop when the user is already on their destination page.

---

- 09. Floor Staff App (Live Feed + Session History) — Mobile-optimized `/floor/[locationId]` with two tabs: Live Feed (merged real-time list of events + order notifications, 5 card types, oldest-first sort, action buttons per type) and Session History (active sessions with expandable order details, running totals, Clear Table button). Web Audio alert on new feed items (triangle-wave pulse, distinct from KDS chime). i18n complete (AR/FR/EN). API: new `GET /api/events`, `PATCH /api/events/[id]`, `GET /api/sessions`. Extended `PATCH /api/orders/[id]` with `ready → delivered` transition. New migration `017_floor_update_policy.sql` for floor UPDATE RLS on orders. Added `?all=true` to `GET /api/orders` for unrestricted status filter.
- 09b. Session conflict & location scope fixes — Renamed `check_needed` → `session_conflict` (migration 018, all code + floor app). Added confirmation gate in customer decline flow (ConfirmDialog between No and blocked). Dedup `session_conflict` events at POST /api/events. Added Clear Table (danger) button to feed card for `session_conflict` events. Fixed `getStaffTenantAndLocation()` return type (`string → string | null`) and patched all 8 API routes to skip location scoping for owners/multi-location managers.
- 10. Admin Dashboard (Live Orders + Analytics) — Four sub-features built in one session:
  - **10A Settings** — `app/(platform)/dashboard/settings/page.tsx` + `components/settings/settings-form.tsx`. Two-section form (Restaurant + Location), each with its own save button. ColorField pattern (native color picker + hex text input, locked to `{primary, accent}` shape for V1). `PATCH /api/tenants/[id]` (owner-only) and `PATCH /api/locations/[id]`. Brand colors validated server-side. Settings page reads from `getStaffRecord` and gates `canEdit` on owner/super_admin role.
  - **10B Staff management** — `app/(platform)/dashboard/staff/page.tsx` + `components/staff/staff-manager.tsx`. New `lib/email.ts` (Resend wrapper, system template using i18n keys). `GET/POST /api/staff` and `PATCH/DELETE /api/staff/[id]`. Full invite flow: create staff row with auth_id NULL → generate JWT → send Resend email with trilingual template → copy-link fallback if email fails → resend → soft-deactivate via `is_active` toggle. Migration 019 adds `is_active BOOLEAN NOT NULL DEFAULT true` to staff and re-creates the `custom_access_token_hook` to filter inactive staff (so deactivated accounts can't sign in). Staff status badges: active (green), pending (amber, no auth_id yet), inactive (muted). Action buttons conditional on status: active → deactivate, inactive → activate, pending → resend + remove. Client maps `code` → translated `staff.error.*` keys (same pattern as `customer-shell.tsx`).
  - **10C Live Orders** — `app/(platform)/dashboard/orders/page.tsx` + `components/orders/live-orders.tsx` + `hooks/use-live-orders.ts`. Extended `GET /api/orders` to accept `?tenant_id=` for owner-level view. Realtime subscription filtered by `tenant_id` (one channel per tenant). Orders grouped by location, then by table, oldest-first. Status left border (4px) + status badge in the card. `delivered` orders fade out after 30s (`DELIVERED_FADE_MS` constant, same pattern as KDS's 8s `ready` fade). Read-only, no action buttons.
  - **10D Analytics** — `app/(platform)/dashboard/analytics/page.tsx` + `components/analytics/analytics-dashboard.tsx` + `app/api/analytics/route.ts`. Migration 020: PL/pgSQL function `generate_daily_snapshot(date, tenant_id)` that aggregates orders + order_items per location and upserts into `analytics_snapshots`. SECURITY DEFINER with caller-tenant check inside the function. Refuses to snapshot today (today is always live). The API lazily generates snapshots for the requested historical range on first read, then reads from snapshots. Top items + peak hours computed live from `order_items` (snapshots only store per-day top-5, too lossy for ranges). Added `recharts` to dependencies. UI: 4 stat cards (orders today, revenue today, avg order value, items sold) + range selector (7d/30d/90d) + Recharts `LineChart` (orders over time) + top items list + 24-square peak hours heatmap (hand-rolled CSS grid with intensity-scaled amber alpha). All colors via `var(--color-*)` tokens.

## Up Next

- 11. Super Admin Panel

---

## Blocked

<!-- Anything blocked and why -->
