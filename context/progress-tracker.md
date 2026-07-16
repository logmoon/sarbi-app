# Progress Tracker

_Read this at the start of every session before doing anything else. Keep it current as you build — it is a live reference, not a closing checklist. Also auto-injected by the memory hook._

---

## Status

| Phase | Status |
|---|---|
| Phase 1 — Foundation | ✅ Complete |
| Phase 2 — Data Layer | ✅ Complete |
| Phase 3 — Customer Product | 🟡 In progress |
| Phase 4 — Operations | 🟡 Started early — Clear Table pulled forward into 07, rest not started |
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
- 07. Session Lifecycle + Timeout — built out of order (before 06c) as a bug-fix pass rather than a planned session. Realtime publication + `REPLICA IDENTITY FULL` enabled (was silently no-op-ing before), lazy timeout enforcement on every session lookup (not a cron job), race-safe session creation (partial unique index), "Are you with [name]?" → "No" blocks instead of joining, with **Clear Table** (`DELETE /api/sessions/[id]`, pulled forward from 09) as the resolution path. `context/build-plan.md` and `sarbi-design-doc.md` updated to match.

---

## Up Next

- **06c. App-wide i18n** — Shared `lib/i18n.ts` lookup with AR/FR/EN for every UI string across the entire app
- 08. Kitchen Display System (KDS)
- 09. Floor Staff App (Live Feed + Session History) — note: Clear Table already exists on the dashboard, this task is really "give floor staff their own live feed + move/duplicate that button"

---

## Blocked

<!-- Anything blocked and why -->
