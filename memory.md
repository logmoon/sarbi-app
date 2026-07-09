# Memory — Table Management + QR Code Generation

_Last updated: 2026-07-09_

---

## What was built

- **Tables page** (`app/(platform)/dashboard/tables/page.tsx`) — server component rendering the tables manager
- **Tables manager** (`components/tables/tables-manager.tsx`) — client orchestrator with fetch/add/update/delete, error banner, empty state, Download All (print window)
- **Table card** (`components/tables/table-card.tsx`) — card with three visual states (Occupied/Available/Inactive), SVG QR preview, PNG/SVG download buttons, show/hide public code toggle with copy
- **Add table dialog** (`components/tables/add-table-dialog.tsx`) — label input with Zod validation
- **Edit table dialog** (`components/tables/edit-table-dialog.tsx`) — label + is_active toggle
- **API routes:**
  - `app/api/tables/route.ts` — GET (tables with session status via LEFT JOIN), POST (create with public_code + qr_code_url)
  - `app/api/tables/[id]/route.ts` — PATCH (update label/is_active), DELETE (with active session guard, returns 409)
- **API helper** (`lib/api-helpers.ts`) — added `getStaffTenantAndLocation()` returning tenant_id + location_id
- **Zod schemas** (`lib/validators.ts`) — `createTableSchema`, `updateTableSchema`
- **Sidebar** (`components/layout/sidebar.tsx`) — removed "Soon" badge from Tables
- **Seed data** (`supabase/seed.sql`) — backfilled `qr_code_url` for all 4 seed tables
- **Docs updated:** `context/progress-tracker.md`, `context/ui-registry.md` (TableCard entry)

## Decisions made

- Location scoping via `getStaffTenantAndLocation()` — single location in V1
- Public code generated server-side (8-char random, retry loop on collision)
- qr_code_url constructed server-side from NEXT_PUBLIC_APP_URL + tenant slug + public_code
- QR images generated client-side via `qrcode` package — SVG for preview (no canvas), PNG via toDataURL (canvas) on download
- Download All uses print-friendly window (no jspdf dependency)
- Session status is a thin boolean via LEFT JOIN on sessions in GET /api/tables
- Three visual states: is_active + has_active_session → Occupied/Available/Inactive

## Problems solved

- **QR preview crashes with "canvas is null":** seed tables had null qr_code_url. Fixed with null guard in component + seed data backfill. SVG generation (toString) doesn't need canvas; toDataURL only used on explicit download button click, wrapped in try/catch.
- **QR preview SVG overflow:** SVG had native width="200" overriding container. Fixed with `[&>svg]:h-full [&>svg]:w-full` + `items-center` on the flex container.
- **Review found 2 critical issues:** QR generation lacking try/catch (added), implicit `any` types on API response parsing (restructured to check-res.ok-first pattern with explicit ApiErrorResponse type).

## Current state

Step 05 complete. Owner can:
- See grid of table cards with status (Occupied/Available/Inactive) via left border + badge
- Add new tables (gets QR code URL generated automatically)
- Edit table label or toggle active/inactive
- Delete tables (blocked if active session exists)
- Download individual QR codes as PNG or SVG
- Download all QR codes as a print-ready page
- Show/hide public code with copy option

## Next session starts with

Step 06 — Customer Menu (Browsing, Cart, Ordering). Build the customer-facing menu page at /[tenantSlug]/table/[publicCode] with name prompt, category tabs, item cards, cart, order placement, call waiter/request bill, language toggle (AR/FR/EN with RTL).

## Open questions

- None from this session.
