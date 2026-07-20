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
| Phase 5 — Management | 🔲 Not started |

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

## Up Next

- 10. Admin Dashboard (Live Orders + Analytics)

---

## Blocked

<!-- Anything blocked and why -->
