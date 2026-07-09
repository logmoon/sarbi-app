# Memory — Database Schema + RLS Policies

_Last updated: 2026-07-08_

---

## What was built

- **SQL migrations 005-010** — 9 new tables: `categories`, `items`, `location_item_overrides`, `tables`, `sessions`, `orders`, `order_items`, `table_events`, `analytics_snapshots`
- **Helper functions** — `get_user_tenant_id()`, `get_user_location_id()` (SECURITY DEFINER for RLS), `check_session_timeout()` (on-access), `update_updated_at_column()` trigger
- **RLS policies** — on all 12 tables (including retrofitting existing 001-004 tables) covering super_admin, owner, location_manager, kitchen, floor, and anon roles
- **Seed data** — 3 categories (Café Chaud, Pâtisseries, Jus Frais), 6 items with multi-language names/descriptions, 4 tables with 8-char public_codes
- **Fixes from review** — CHECK constraint for kitchen/floor location_id NOT NULL, CHECK for public_code length = 8, ON DELETE SET NULL on orders.cancelled_by, consistent type casts, cleaner interval math

## Decisions made

- No pg_cron — session timeout enforced on-access via `check_session_timeout()` called by API routes
- RLS uses helper functions with SECURITY DEFINER (not inline subqueries) to avoid RLS-on-subquery issues
- Categories/items are tenant-scoped (not location-scoped); location overrides via `location_item_overrides`
- Status fields use typed ENUMs (order_status, session_status, event_type, event_status)
- Anon policies allow SELECT on tenants, available categories/items, and tables (needed for customer menu SSR)

## Problems solved

- `auth.uid()` returns `uuid` but `staff.auth_id` is `TEXT` — fixed with explicit `::text` casts in helper functions and policies
- Existing tables (tenants, locations, staff) had RLS **enabled** but **zero policies** — 010 migration adds policies to all 3 retroactively
- `check_session_timeout()` uses `session_timeout * interval '1 minute'` instead of string concatenation for interval construction

## Current state

Step 03 complete. All 12 tables exist with RLS enforced. Seed data populates the dev tenant with menu items and tables. The build passes clean.

## Next session starts with

Step 04 — Menu CRUD (Admin Dashboard Editor). Build the menu editor UI: category list, item cards, add/edit/delete modals, drag reorder, availability toggle, image upload.

## Open questions

- None from this session.
