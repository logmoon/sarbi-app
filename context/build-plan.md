# Build Plan

## Core Principle

Foundation first (scaffold, auth, database), then data layer (menu, tables), then the customer-facing product (menu browsing + ordering), then operational interfaces (KDS, floor app), then management and monitoring (dashboard, super admin). Each feature is one agent session. UI before logic where both exist. Nothing from "Out of Scope" appears here.

---

## Phase 1 — Foundation

### 01 Project Scaffold + Supabase Setup

**UI:**

- Initialize Next.js 14 project with App Router + TypeScript
- Install and configure Tailwind CSS with custom theme tokens (amber accent, spacing scale, typography)
- Set up `globals.css` with CSS custom properties for all design tokens
- Create root layout with Inter font, metadata, basic HTML structure
- Create `.env.local.example` with all required env vars

**Logic:**

- Create Supabase client helpers: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/admin.ts` (service role)
- Set up Upstash Redis client in `lib/redis.ts`
- Create shared utility functions in `lib/utils.ts` (formatPrice, cn, timeAgo)
- Create Zod validation schemas in `lib/validators.ts`

**Exit criteria:** `npm run dev` starts, Tailwind classes render, Supabase client connects to local/remote project, Redis client initializes.

---

### 02 Supabase Auth + Role System

**UI:**

- Build login page (`/login`) with email + password form
- Build auth layout (centered card, no sidebar)

**Logic:**

- Create `custom_access_token_hook` PL/pgSQL function that reads role from `staff` table and injects `user_role` claim into JWT
- Create Next.js middleware that refreshes Supabase session on every request and protects `/dashboard`, `/kds`, `/floor`, `/superadmin` routes
- Create `lib/supabase/server.ts` helper that returns an authenticated server client
- Implement login flow: Supabase signInWithPassword → redirect to appropriate dashboard based on role

**Exit criteria:** Owner can log in and is redirected to `/dashboard`. Unauthenticated users hitting protected routes are redirected to `/login`. JWT contains `user_role` claim. (Signup is deferred — V1 uses invite-only via staff management.)

---

### 03 Database Schema + RLS Policies

**UI:** None

**Logic:**

- Write SQL migrations for all tables: `tenants`, `locations`, `staff`, `categories`, `items`, `location_item_overrides`, `tables`, `sessions`, `orders`, `order_items`, `table_events`, `analytics_snapshots`
- Enable RLS on every tenant-scoped table
- Create RLS policies for each role: owner sees all rows for their tenant, kitchen/floor see rows for their assigned location, super_admin sees everything
- Create database functions for: session timeout check, order total computation, analytics snapshot generation
- Create seed script for dev data

**Exit criteria:** All tables exist, RLS policies block cross-tenant access, role-based SELECT/INSERT/UPDATE/DELETE work correctly per the policy patterns in architecture.md.

---

## Phase 2 — Data Layer

### 04 Menu CRUD (Admin Dashboard Editor)

**UI:**

- Build dashboard layout with sidebar navigation (Menu, Tables, Orders, Staff, Analytics, Settings)
- Build menu editor page: category list with drag-to-reorder, item cards within each category
- Build item card: image thumbnail, name (truncated), price, availability toggle (prominent)
- Build item edit modal: multi-language tabs (AR/FR/EN), price field, description fields, image upload, availability toggle
- Build category add/rename/delete UI
- Build "mark entire category unavailable" button

**Logic:**

- API routes: `GET/POST/PATCH/DELETE /api/menu/categories`, `GET/POST/PATCH/DELETE /api/menu/items`
- Server-side validation with Zod schemas
- Image upload to Supabase Storage with automatic optimization
- Drag-and-drop reorder (persist sort_order to DB)
- Availability toggle (instant, no page refresh)

**Exit criteria:** Owner can create categories, add items with multi-language content, upload images, toggle availability, drag-reorder. Changes persist to DB and reflect immediately.

---

### 05 Table Management + QR Code Generation

**UI:**

- Build tables page: grid of table cards showing label, session status (active/idle), QR download button
- Build "Add Table" form: label input, generate QR on submit
- Build QR download: PNG and SVG options, print-ready sizing
- Build "Download All" button (generates PDF sheet of all QR codes)

**Logic:**

- API routes: `GET/POST/PATCH/DELETE /api/tables`
- Generate 8-character random `public_code` server-side (not UUID, not sequential)
- Generate QR code URL: `https://menu.sarbi.tn/[tenantSlug]/table/[publicCode]`
- Use `qrcode` npm package for SVG/PNG generation
- Store `qr_code_url` in tables table

**Exit criteria:** Owner can add tables, each gets a unique public_code, QR codes are downloadable as PNG/SVG, QR encodes the correct customer menu URL.

---

## Phase 3 — Customer Product

### 06 Customer Menu (Browsing, Cart, Ordering)

**UI:**

- Build customer menu page (`/[tenantSlug]/table/[publicCode]`): SSR for fast load
- Build name prompt modal (first visit, soft identity)
- Build category tabs (horizontal scrollable bar at top)
- Build item cards: image, name, description (truncated), price in TND
- Build floating cart button (shows item count + total)
- Build cart drawer: item list, quantities, total, "Place Order" button
- Build order confirmation modal
- Build "Call Waiter" and "Request Bill" buttons
- Build language toggle (AR/FR/EN) with RTL layout for Arabic
- Apply restaurant's brand theme (colors, typography from `tenants.brand_colors` / `theme_config`)

**Logic:**

- API routes: `POST /api/orders` (create order), `POST /api/events` (waiter call, bill request)
- Server-side session lookup: resolve `public_code` → table → location → active session
- Server-side item availability re-validation on order submit (reject unavailable items, let rest through)
- Snapshot item_name and item_price into order_items at order time
- Session cookie management (identify returning customer within session)
- Starter tier check: if tenant plan = 'starter', hide cart/order UI, show menu browse only

**Exit criteria:** Customer scans QR, sees themed menu in their language, enters name, browses categories, adds items to cart, places order. Order appears in DB with correct snapshots. Starter tier shows menu only with no ordering UI.

---

### 06b Customer Menu UX Polish

**UI:**

- Restructure menu item cards to vertical layout (image top, content middle, price+button pinned bottom) with consistent `min-h`, + button pinned to top-right corner
- Switch items container to 2-column grid (`grid grid-cols-2 gap-3`)
- Add tab switcher (Menu / My Orders) below page header, replacing the category tabs bar when on My Orders tab
- Build My Orders tab: list of session orders with items, totals, and color-coded status badges (pending=red, in_progress=yellow, ready=green, delivered=grey)
- Add Supabase Realtime subscription on `orders` by `session_id` so status changes reflect live
- Show "Hello, {name}" in header when session is active
- Add text labels to Call Waiter and Request Bill buttons
- Hide Request Bill button when session has zero non-cancelled orders
- Waiter Called state persists across page reload and device: on mount, check for unresolved `waiter_called` / `bill_requested` events for this session and restore visual state

**Logic:**

- **Server-side event dedup:** `POST /api/events` checks for existing pending event of same type for this session before inserting. If unresolved exists, return existing — no duplicate.
- **New API:** `GET /api/events/check?session_id=X&type=waiter_called` — returns `{ pending: true }` or `{ pending: false }` for state restore on mount
- **New API:** `GET /api/orders?session_id=xxx` — returns orders + order_items for a session
- **New hook:** `use-orders.ts` — fetches session orders, subscribes to Realtime UPDATE on `orders` filtered by `session_id`, exposes orders array + loading state

**Exit criteria:** Cards render in a uniform 2-column grid. + button is always in the same spot. Customer sees a "My Orders" tab with live-updating order status. Waiter call and bill request are server-deduped across devices. Bill request is hidden until orders exist. Waiter call state restores on refresh. Customer name visible in header. All three button states are clear at a glance.

---

---

### 06c App-wide i18n

**UI:**

- Create `lib/i18n.ts` with a shared label lookup keyed by locale + key, covering all customer-facing UI text across the entire app (customer menu, KDS, floor app, admin dashboard, super admin)
- Replace all inline label objects and hardcoded English strings with `t(locale, 'key')` calls
- Status labels, button text, headers, empty states, error toasts, form labels, nav items

**Logic:**

- Simple object map: `const labels: Record<Locale, Record<string, string>>` with keys like `'menu.tab'`, `'orders.tab'`, `'call_waiter'`, `'request_bill'`, `'hello_name'`, `'order.pending'`, `'order.in_progress'`, `'order.ready'`, `'order.delivered'`, `'order.cancelled'`, `'no_orders'`, etc.
- Export `t(locale, key, params?)` function with optional interpolation for dynamic values like `{name}`
- AR, FR, EN for every key

**Exit criteria:** No hardcoded English UI strings anywhere in the app. All customer-facing text uses `t()` from `lib/i18n.ts`. Arabic and French speakers see the full app in their language.

---

### 07 Session Lifecycle + Timeout

**UI:**

- Build "Are you with [name]?" confirmation prompt (when active session exists and customer has no cookie)
- Build session active indicator (subtle UI element showing current session)

**Logic:**

- Session creation: on first scan of a table with no active session, create session record
- Session joining: on "Yes" to "Are you with [name]?", join existing session (customer gets own name for order attribution)
- Session mismatch: on "No", insert `check_needed` table_event, let customer into menu under existing session
- Session timeout: database function or cron job that closes sessions older than location's `session_timeout` (default 150 min) with `closed_by = 'timeout'`
- Cookie-based session identification: store session_id in a cookie, check on subsequent visits

**Exit criteria:** New scan on idle table creates session. New scan on active table shows confirmation. "Yes" joins, "No" creates check_needed event. Sessions auto-close after timeout. Returning customer with cookie skips name prompt.

---

## Phase 4 — Operations

### 08 Kitchen Display System (KDS)

**UI:**

- Build KDS page (`/kds/[locationId]`): full-screen, dark background
- Build order queue card: table label (large), customer name, time counter (live, turns amber at 10min, red at 15min), items list with quantities, notes field
- Build action buttons: "Start Order" → "Mark Ready" (progressive, one button at a time)
- Build cancel button (secondary, smaller) with reason picker modal (out of stock / kitchen error / other)
- Build card border colors: PENDING = red, IN_PROGRESS = yellow, READY = green (fades out)
- Add sound: kitchen chime on new PENDING order (Web Audio API, loops every 30s until acknowledged)

**Logic:**

- Supabase Realtime subscription: listen for INSERT and UPDATE on `orders` table filtered to this location
- API routes: `PATCH /api/orders/[id]` for status transitions (validate allowed transitions)
- Time counter: client-side timer, updates every second
- Sound playback: Web Audio API, configurable volume

**Exit criteria:** Kitchen staff logs in, sees live order queue. New order appears with chime. Taps "Start" → card turns yellow. Taps "Done" → card turns green and exits queue. Can cancel with reason from PENDING or IN_PROGRESS. Time counter visible and color-coded.

---

### 09 Floor Staff App (Live Feed + Session History)

**UI:**

- Build floor app page (`/floor/[locationId]`): mobile-optimized, single-hand use
- Build live feed: sorted by urgency (age), four card types: ORDER READY, WAITER CALLED, BILL REQUESTED (with running total), CHECK TABLE
- Build ORDER CANCELLED card ( surfaces kitchen cancellations with reason)
- Build action buttons per card: CONFIRM DELIVERED, RESOLVE, ACKNOWLEDGE
- Build session history tab: list of active sessions, order history per session, running total per session
- Build "Clear Table" button per session with confirmation dialog
- Add sound: floor alert on new feed item (different tone from kitchen chime)

**Logic:**

- Supabase Realtime subscription: listen for INSERT on `table_events` and UPDATE on `orders` (status = 'ready') filtered to this location
- Session running total: computed from `SUM(subtotal)` of non-cancelled `order_items` in session
- API routes: `PATCH /api/events/[id]` (resolve), `PATCH /api/orders/[id]` (confirm delivered), `DELETE /api/sessions/[id]` (clear table)
- Sound playback: Web Audio API

**Exit criteria:** Floor staff logs in, sees live feed. Order ready notification appears with alert sound. Bill request shows running total. Check table alert appears on session mismatch. Can resolve each item. Session history tab shows all active sessions with order details and totals. Can clear table (closes session).

---

## Phase 5 — Management

### 10 Admin Dashboard (Live Orders + Analytics)

**UI:**

- Build orders page: read-only real-time view of all current orders, grouped by table, showing status
- Build analytics page: today's order count, estimated revenue, orders over time chart (7d/30d/90d), top 5 items, peak hour heatmap
- Build settings page: restaurant info (name, address, logo, brand colors), session timeout config
- Build staff management page: list of staff accounts, add new staff (name, email, role), deactivate accounts

**Logic:**

- Supabase Realtime subscription for live orders view
- Analytics queries: aggregate from `orders`, `order_items`, `analytics_snapshots`
- Staff CRUD: API routes for creating staff accounts (creates Supabase Auth user + staff record)
- Settings CRUD: API routes for tenant updates

**Exit criteria:** Owner sees live orders updating in real time. Analytics show correct today's stats, charts render. Staff can be added with correct roles. Settings save and reflect on customer menu.

---

### 11 Super Admin Panel

**UI:**

- Build super admin page (`/superadmin`): tenant list with search, plan filter
- Build tenant detail view: locations, staff count, order volume, current plan, payment status
- Build plan override UI: dropdown to change plan, set expiry date
- Build impersonation button: "View as tenant" → opens tenant's dashboard

**Logic:**

- API routes: `GET /api/tenants` (list), `GET /api/tenants/[id]` (detail), `PATCH /api/tenants/[id]` (plan override)
- Impersonation: create a temporary session as the tenant's owner, redirect to their dashboard
- Audit log: record all super admin actions (impersonations, plan overrides)

**Exit criteria:** Super admin can list all tenants, search/filter, view tenant details, override plans, impersonate tenants. Actions are logged.
