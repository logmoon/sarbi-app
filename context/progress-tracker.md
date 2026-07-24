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
| Phase 5 — Management | 🔄 In Progress (Task 10 done, Task 11 not started) |

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
- 10. Admin Dashboard (Live Orders + Analytics) — Four sub-features built in one session, then a full bug-fix + Menu Theme pass in a second session (this entry now reflects final state; see `memory.md` history for the two-session arc):
  - **10A Settings** — `app/(platform)/dashboard/settings/page.tsx` + `components/settings/settings-form.tsx`. Now **three** sections (Restaurant, **Menu Theme**, Location), each with its own save button — was originally two, brand color was locked to `{primary, accent}`. `PATCH /api/tenants/[id]` (owner-only) and `PATCH /api/locations/[id]`. Settings page reads from `getStaffRecord` and gates `canEdit` on owner/super_admin role.
    - **10E Menu Theme Customization** (added, not originally scoped) — `tenants.brand_colors` JSONB grew to `{primary, surface, font, layout}` (no migration needed, same column); new `tenants.cover_url` column (migration 023). New `lib/brand.ts` (theme derivation: `themeStyleVars`/`parseMenuTheme`), `lib/fonts.ts` (next/font/google, centralized), `app/(public)/layout.tsx` (scopes font loading to customer pages only). Widened settings container to `max-w-5xl`. New `MenuThemePreview` component — a live preview built from the *real* `CategoryTabs`/`MenuItemCard` components, not a mockup, so it can't drift from what customers actually see. 6 surface tones (light/warm/sage/blush/slate/dark), 4 heading-font presets (modern=Inter/classic=Playfair Display/playful=Quicksand/bold=Fraunces — an initial "elegant"=Cormorant Garamond preset was replaced with Fraunces after shipping, because Cormorant read too thin/small at UI text sizes), 3 card layout presets (grid/compact/magazine, `MenuItemCard` now dispatches over all three). Heading font applies to titles only (restaurant name, category tabs, item names, dialog titles) — never body/price text. Full detail: `ui-registry.md` → "Menu Theme System", `ui-tokens.md` → "Menu Theme", `ui-rules.md` → "Tenant Menu Theming" (the "curated presets, never raw pickers" principle this is built on).
  - **10B Staff management** — `app/(platform)/dashboard/staff/page.tsx` + `components/staff/staff-manager.tsx`. New `lib/email.ts` (Resend wrapper, system template using i18n keys). `GET/POST /api/staff` and `PATCH/DELETE /api/staff/[id]`. Full invite flow: create staff row with auth_id NULL → generate JWT → send Resend email with trilingual template → copy-link fallback if email fails → resend → soft-deactivate via `is_active` toggle. Migration 019 adds `is_active BOOLEAN NOT NULL DEFAULT true` to staff and re-creates the `custom_access_token_hook` to filter inactive staff. Staff status badges: active (green), pending (amber, no auth_id yet), inactive (muted).
    - **Bug fix:** deactivation didn't actually fully work at the app layer — `getStaffRecord()`/`getStaffTenantId()`/`getStaffTenantAndLocation()` (`lib/api-helpers.ts`) queried `staff` by `auth_id` with no `is_active` filter, so a deactivated account still resolved a full role/location everywhere those helpers gate access. In practice RLS already blocked real data access (Postgres policies check the JWT's `user_role` claim, which migration 019's hook does null out for inactive staff at token-issuance time) — but the app layer didn't know that, so a deactivated login fell through to a dashboard shell with a working nav bar and every request failing "Forbidden". Fixed in two parts: (1) added `.eq("is_active", true)` to all three helpers, so a deactivated account is now treated as having no staff record anywhere; (2) new `/account-deactivated` page + a check in `(platform)/layout.tsx` gives that case a real landing page instead of an empty dashboard — see `ui-registry.md` → "Account Deactivated Page" for why it has to sit outside both the `(auth)` and `(platform)` route groups and self-sign-out before offering a way out.
  - **10C Live Orders** — `app/(platform)/dashboard/orders/page.tsx` + `components/orders/live-orders.tsx` + `hooks/use-live-orders.ts`. Extended `GET /api/orders` to accept `?tenant_id=` for owner-level view. Realtime subscription filtered by `tenant_id` (one channel per tenant). Orders grouped by location, then by table, oldest-first. Status left border (4px) + status badge in the card.
    - **Bug fix:** delivered orders used to disappear almost immediately and status filters didn't work at all. Two compounding causes: the API applied the KDS's 2-minute `ready`-staleness cutoff to `delivered` orders too (removed — delivered/cancelled now live for the full 24h dashboard window like everything else), and the hook separately auto-deleted delivered orders from local state 30s after arrival (`DELIVERED_FADE_MS`, removed entirely — that pattern belongs to the KDS's live queue, not an owner's full-day review dashboard). Filtering was also structurally broken: the "active" section had a hardcoded status allowlist independent of whatever filter was selected, so choosing "Delivered" always showed nothing. Rebuilt around one unified `filtered` memo, partitioned into the existing active-by-location grid and a new collapsible "Today's history" section (delivered + cancelled, open by default).
  - **10D Analytics** — `app/(platform)/dashboard/analytics/page.tsx` + `components/analytics/analytics-dashboard.tsx` + `app/api/analytics/route.ts`. Migration 020: PL/pgSQL function `generate_daily_snapshot(date, tenant_id)` that aggregates orders + order_items per location and upserts into `analytics_snapshots`. SECURITY DEFINER with caller-tenant check inside the function. Refuses to snapshot today (today is always live). UI: 4 stat cards + range selector (7d/30d/90d) + Recharts `LineChart` (orders over time) + top items list + peak hours chart.
    - **Bug fix:** every historical day showed zero orders. The API called `generate_daily_snapshot` through the admin/service-role client, which has no `auth.uid()` — so the function's own internal tenant check always failed (`[analytics] snapshot failed ... Forbidden`, silently swallowed), and no snapshot was ever written. Fixed by calling the RPC through the caller's own session-scoped client instead, so `auth.uid()` resolves and the check passes.
    - **Bug fix:** peak hours bucketed by `getUTCHours()` — no relationship to the restaurant's local schedule, so the "peak" landed at whatever hour local rush happens to fall at UTC. Replaced the UTC bucketing with `Intl.DateTimeFormat` against a fixed `RESTAURANT_TIMEZONE` constant, and replaced the 24-cell CSS-grid heatmap with a Recharts `BarChart` (highlighted peak bar + an explicit "busiest around X — N orders" callout) since a grid of near-identical amber squares didn't communicate "when" nearly as directly.
  - **Cross-cutting bug fix (found while working on the above, not scoped to any one sub-feature):** `/floor` and `/kds` were completely unreachable — an infinite redirect loop. `(platform)/layout.tsx` used to hold the "send kitchen/floor/super_admin to their own app" redirect, guarded by comparing an `x-pathname` header (threaded from `middleware.ts`) against the computed destination to avoid redirecting to the page already being viewed — that guard reliably failed to recognize "already there" for `/floor`/`/kds` specifically, so landing on either page redirected to itself forever. Fixed structurally rather than debugging the header comparison further: moved that redirect into `dashboard/layout.tsx` only, so it's now architecturally impossible for `/floor` or `/kds` (which never pass through that layout) to loop back into it.

## Up Next

- 11. Super Admin Panel

---

## Blocked

<!-- Anything blocked and why -->
