# Memory — Kitchen Display System (Task 08) + Auth Screen Redesign

_Last updated: 2026-07-18_

---

## What was built

Two separate pieces of work in one session, both requested directly by the developer (built out of the plan's stated order — 06c i18n was next per `progress-tracker.md`, but KDS was explicitly requested instead).

### 1. Kitchen Display System (Task 08)

- **`app/(platform)/kds/[locationId]/page.tsx`** — server component. Resolves the requested location, enforces the tenant boundary and role-based location scoping (kitchen/single-location managers locked to their own location; owners/multi-location managers can view any location in their tenant), renders `KdsBoard`.
- **`components/kds/kds-board.tsx`** — client orchestrator: wires `useKdsOrders` + `useKdsSound`, renders the header (location name, order count, mute toggle), the responsive card grid, loading/error/empty states, and the cancel modal.
- **`components/kds/order-queue-card.tsx`** — the dark card itself: table label, customer name, live elapsed timer (color escalates at 10min/15min), items with notes, status border + text label (never color alone), progressive action button, cancel button. Fades out via a CSS transition keyed to `READY_FADE_MS` so the animation and the actual removal timing can't drift apart.
- **`components/kds/cancel-order-modal.tsx`** — reason picker (out of stock / kitchen error / other + free text), reuses the existing `Dialog` primitive as-is (stays light-themed intentionally).
- **`hooks/use-kds-orders.ts`** — fetch + Realtime subscription (INSERT/UPDATE) filtered by `location_id`, client-side fade/removal for `ready` orders, immediate removal on `cancelled`/`delivered`.
- **`hooks/use-kds-sound.ts`** — Web Audio chime, unlocks on first pointer/keydown anywhere on the page (no blocking "enable sound" splash), loops every 30s while any `pending` order exists, mute preference in `localStorage`.
- **`app/api/orders/[id]/route.ts`** (new) — `PATCH`, single state machine for start/ready/cancel. Cancel now uses the `cancelled_reason`/`cancelled_by` columns that existed since Task 07 but were unused.
- **`app/api/orders/route.ts`** — `GET` extended to accept a staff-authenticated `location_id` alongside the existing customer-facing `session_id` path; excludes `ready` orders older than ~2 minutes so a fresh page load doesn't show stale ones (no "mark delivered" step exists yet — that's Task 09).
- **New dark KDS design tokens** — `--color-kds-*` in `globals.css`, mapped in `tailwind.config.ts`, documented in `ui-tokens.md`. Also fixed the two KDS typography rows in `ui-tokens.md` that referenced `--color-text-primary` (same hex as the new KDS background — would've been invisible).
- **`lib/api-helpers.ts`** — added `getStaffRecord()` (role/tenant/location straight from the `staff` table) and extended `getStaffTenantAndLocation()` to also return `staffId`.

**Bug fix (blocking, pre-existing, found before writing any KDS code):** `app/(platform)/layout.tsx` read staff role off `user.app_metadata`, which `custom_access_token_hook` (migration 004) never populates — it writes `user_role` into the JWT's own claims instead, which `getUser()` doesn't surface. Confirmed against Supabase's docs and the installed `@supabase/supabase-js@2.110.0` source (`getClaims()` exists and is the documented way to read verified custom claims). Ended up fixing it by reading from the `staff` table instead (`getStaffRecord()`), matching how every other staff-authenticated route in this codebase already works, rather than introducing `getClaims()` as a second, different auth-reading convention. Also added `x-pathname` header forwarding in `middleware.ts` so the layout's redirect can tell when the user is already on their destination page — fixing the role-read bug would otherwise have caused a genuine redirect loop for kitchen/floor users on their own `/kds`/`/floor` page, since the original code had no such guard (harmless before only because the bug it's paired with meant the redirect branch never ran at all).

### 2. Auth screen redesign (login + setup) — UI/UX only, no functional changes

Developer's own words: the previous coding agent's auth screens were "horrible, purely UI/UX speaking." Chose the "refined single card" direction over a split-screen option (asked via a quick either/or).

- **`app/(auth)/layout.tsx`** — added a real wordmark (reused the existing amber `text-accent font-bold` treatment from the dashboard sidebar, just larger) with a one-line tagline, a subtle on-brand `QrMotifBackground` (sparse irregular grid of rounded squares at 5% opacity — a nod to what Sarbi actually is, not a literal QR code, not a generic gradient), wider card padding, and a single `motion-safe:animate-fade-in` entrance (new Tailwind keyframe, properly registered rather than an ad-hoc arbitrary value). Auth-guard redirect logic (`if (user) redirect("/dashboard")`) untouched.
- **`app/(auth)/login/page.tsx`** — warmer heading/copy, error message restyled to match the existing `ActionButtons` error-toast convention (icon + text box, not just red text), inline spinner on the submit button instead of a plain text swap. Same fields, same `signInWithPassword` call, unchanged.
- **`app/(auth)/setup/page.tsx`** — same treatment applied across all three states (validating / invalid invite / the form itself), with a personalized subline once the invite's name loads. Same validation, same `/api/setup` calls, unchanged.
- `context/ui-registry.md` — new entry for the auth screen pattern.

**Open question raised, not yet resolved:** the developer asked to move or remove "that language selector" on the auth screens. There is no language selector anywhere in this repo — not on the auth screens, not globally (no i18n routing in `next.config.js`, only one branch, no stashes). It's possible it only existed in local/uncommitted changes from their previous agent that never made it into this repo, or they were thinking of the customer menu's `LanguageToggle` (AR/FR/EN), which is unrelated and untouched. Asked the developer to clarify; did not guess or invent something to remove.

## Decisions made

- **One PATCH endpoint, not two**, for KDS start/ready/cancel — see Task 08 entry in `progress-tracker.md`/`build-plan.md` for full reasoning.
- **Fixed the `app_metadata` role-read bug via the `staff` table, not `getClaims()`** — even though `getClaims()` is the technically-correct fix for the literal bug, matching this codebase's own established convention (every other staff route re-derives role/tenant/location fresh from the `staff` table, never trusts JWT claims at the app layer) was judged more consistent and equally correct, since RLS already reads role from the JWT independently as the second enforcement layer.
- **Auth redesign stayed strictly within existing tokens** — no new palette, no new fonts, no invented copy/links (no fake support email, no forgot-password link since that flow doesn't exist). The frontend-design skill's "ground it in the subject" principle was applied to an already-branded existing product, not a blank slate — the QR-motif background is the one deliberate risk taken, justified by what Sarbi actually is.
- **Didn't guess at the "language selector"** — asked instead of silently removing or moving the wrong thing, since nothing matching that description exists in this repo to act on.

## Problems solved

- Kitchen/floor/super_admin staff were never actually being redirected to their own app (see bug fix above) — this would have blocked KDS access entirely (and was the developer's specific fear, raised before any code was written, based on a similar issue they'd hit with a different coding agent).
- `cancelled_reason`/`cancelled_by` columns (existed since Task 07) were dead weight until now — KDS cancellation finally uses them instead of a second, inconsistent `metadata`-based approach.
- Auth screens no longer look like unstyled scaffolding.

## Current state

- KDS is feature-complete per the Task 08 build-plan spec and committed to `main` (commit `b6a2478`, not pushed).
- Auth screens are redesigned and committed to `main` (commit `4faa05c`, not pushed).
- Both verified via `tsc --noEmit`, `next lint`, and a full `next build` (fonts stubbed only for the build check, due to this environment's network restrictions — not a real issue, restored immediately after). Nothing has been tested against a live Supabase instance from this environment.
- No floor app, no i18n yet. Task 09 (Floor Staff App) is the natural next operations gap — KDS exists now, but there's still no floor-facing live feed beyond the dashboard's Clear Table button.

## Next session starts with

Ask the developer directly rather than assume: **06c (i18n)**, **09 (Floor Staff App)**, or something else — same open question as last session, still not obviously resolved by the plan order alone. Also worth following up on the language-selector question above if it wasn't resolved in this session.

## Open questions

- The language-selector question above — unresolved as of this memory update.
- (Carried over, still open) Should `check_needed` events ever auto-resolve, or only via explicit staff action? Not urgent until Task 09's live feed exists.
- Migrations 015/016 (from last session) and this session's changes still need to be tested against the developer's real Supabase project and pushed — nothing here has been pushed to `origin/main`.
