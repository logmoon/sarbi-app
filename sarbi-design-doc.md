# QR Table Ordering SaaS — Design Document

> **Status:** Pre-development  
> **Market:** Tunisia (primary), MENA (expansion)  
> **Model:** Multi-tenant SaaS, sold face-to-face and self-serve  
> **Last updated:** July 2026 (v1.1 — cancellation flow, session-mismatch handling, bill totals, shorter QR URLs, RLS, AI deferred to V2)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Core Principles](#2-core-principles)
3. [System Actors](#3-system-actors)
4. [Data Architecture](#4-data-architecture)
5. [Tenant & Location Model](#5-tenant--location-model)
6. [Menu Architecture](#6-menu-architecture)
7. [Table & Session Model](#7-table--session-model)
8. [Order Lifecycle](#8-order-lifecycle)
9. [The Five Interfaces](#9-the-five-interfaces)
10. [Notification System](#10-notification-system)
11. [AI Features (V2)](#11-ai-features-v2--not-part-of-v1)
12. [Subscription Tiers & Progressive Disclosure](#12-subscription-tiers--progressive-disclosure)
13. [Tech Stack](#13-tech-stack)
14. [System Architecture Diagram](#14-system-architecture-diagram)
15. [Business Model](#15-business-model)
16. [MVP Scope](#16-mvp-scope)
17. [Future Considerations](#17-future-considerations)

---

## 1. Product Overview

A multi-tenant SaaS platform that enables cafés and restaurants to deploy QR-based digital menus and table ordering systems with zero hardware requirements. Customers scan a QR code on their table, browse the menu, and place orders directly from their phone browser — no app download required. Orders flow in real time to a kitchen display and floor staff feed. Payment remains at the cashier, keeping the flow simple and compatible with the Tunisian market.

The platform serves five distinct user types across three separate interface contexts, all managed under a single codebase.

### What it replaces

- Physical menus (printing, reprinting, laminating)
- Verbal order-taking by waiters
- Order relay from floor to kitchen
- Paper order tickets
- Waiter hand-signals and shouting across the room

### What it adds

- Real-time order tracking per table
- Instant menu updates (sold out, price change)
- Kitchen queue management
- Floor staff task feed
- Analytics on orders, popular items, peak hours
- AI-powered menu theming
- AI chatbot for customers (menu assistant) and owners (analytics assistant)

---

## 2. Core Principles

These principles govern every design and product decision made in this document and going forward.

**Progressive disclosure over feature dumping**
Complexity is hidden until it's earned. A single-location restaurant never sees the word "Location" anywhere. An owner not on the AI tier never sees an AI prompt or a locked feature banner. Features reveal themselves when the account state requires them.

**Operator context awareness**
Each interface is designed for its specific user's physical and cognitive context. The kitchen screen is designed for greasy hands and a glance from 2 meters. The floor staff app is designed for someone walking and doing three things at once. The admin dashboard is designed for someone sitting at a desk with time to think. These are not the same interface with different data.

**Staff should barely need training**
Any waiter or kitchen staff member should be able to understand their interface in under two minutes. If an interface requires explanation, it's too complex.

**The customer experience is the product**
The customer-facing menu is what justifies the subscription. It should feel like it was designed specifically for that restaurant, not like a generic SaaS template.

**Tunisia-first**
Prices in TND. Arabic and French language support with RTL layout for Arabic. No dependency on payment gateways. No features that require infrastructure Tunisia doesn't reliably have. Cash payment at the cashier is a first-class citizen, not a fallback.

---

## 3. System Actors

### Platform Level

**Super Admin (you)**
Access to a platform-wide panel. Manages all tenants, views aggregate analytics, handles account flags, manages subscription states, and can impersonate any tenant for support purposes.

### Tenant Level

**Owner / Brand Admin**
Creates and manages the tenant account. Has full access to the admin dashboard: menu management, table setup, QR code generation, staff account management, analytics, and billing. Typically the café or restaurant owner or manager.

**Location Manager** *(only visible for multi-location tenants)*
Scoped to a specific location. Can manage that location's menu overrides, tables, and local staff. Cannot touch billing, brand-level settings, or other locations.

**Kitchen Staff**
Role-scoped access. Sees only the Kitchen Display System (KDS) for their assigned location. No access to any other part of the platform.

**Floor Staff / Waiter**
Role-scoped access. Sees only the Floor Staff app for their assigned location. Receives order-ready notifications, waiter calls, and bill requests. No access to any other part of the platform.

### Customer Level

**Diner**
Scans the QR code on their table. Lands directly on the menu — no login, no account, no friction. Provides only their name before ordering. Entirely anonymous to the system beyond their session.

---

## 4. Data Architecture

### Entity Hierarchy

```
Platform
  └── Tenant (Brand)
        ├── Subscription
        ├── Locations[]
        │     ├── Tables[]
        │     │     └── Sessions[]
        │     │           └── Orders[]
        │     │                 └── OrderItems[]
        │     ├── Staff[]
        │     └── Menu (inherits from Brand, with overrides)
        └── Menu (Brand-level base)
              ├── Categories[]
              └── Items[]
                    └── (future: OptionGroups[] → Options[])
```

### Core Tables (PostgreSQL via Supabase)

#### `tenants`
```
id                UUID PK
name              TEXT              -- Brand name
slug              TEXT UNIQUE       -- Used in URLs
logo_url          TEXT
brand_colors      JSONB             -- { primary, secondary, accent }
theme_config      JSONB             -- AI-generated or custom theme
plan              ENUM              -- starter | pro | business
plan_expires_at   TIMESTAMP
created_at        TIMESTAMP
```

#### `locations`
```
id                UUID PK
tenant_id         UUID FK → tenants
name              TEXT
address           TEXT
is_active         BOOLEAN
session_timeout   INTEGER           -- Minutes, default 150 (2.5hr), customizable
created_at        TIMESTAMP
```

#### `staff`
```
id                UUID PK
tenant_id         UUID FK → tenants
location_id       UUID FK → locations (nullable for owner only — see below)
email             TEXT UNIQUE
name              TEXT
role              ENUM              -- owner | location_manager | kitchen | floor
auth_id           TEXT              -- Better Auth user ID
created_at        TIMESTAMP
```

**`location_id` nullability by role:**
- `owner` — nullable. Null means access to all of the tenant's locations (the common case for single-location tenants, where "all locations" is just the one location anyway).
- `location_manager` — required. Scoped to exactly one location by definition.
- `kitchen` / `floor` — required, enforced at the application layer. Their entire interface (KDS, Floor app) is loaded from a single-location URL (`/kds/[location-id]`, `/floor/[location-id]`), so a kitchen or floor account with no location would have nowhere to log into. A staff record with role `kitchen` or `floor` and a null `location_id` is an invalid state and should be rejected at creation time, not just in the UI.

#### `categories`
```
id                UUID PK
tenant_id         UUID FK → tenants
name_ar           TEXT
name_fr           TEXT
name_en           TEXT
sort_order        INTEGER
is_visible        BOOLEAN
created_at        TIMESTAMP
```

#### `items`
```
id                UUID PK
tenant_id         UUID FK → tenants
category_id       UUID FK → categories
name_ar           TEXT
name_fr           TEXT
name_en           TEXT
description_ar    TEXT
description_fr    TEXT
description_en    TEXT
price             DECIMAL(10,3)     -- TND, 3 decimal places
image_url         TEXT
is_available      BOOLEAN           -- Toggle on/off instantly
is_featured       BOOLEAN           -- For AI upsell prompts
sort_order        INTEGER
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### `location_item_overrides` *(multi-location feature, MVP data model only)*
```
id                UUID PK
location_id       UUID FK → locations
item_id           UUID FK → items
price_override    DECIMAL(10,3)     -- Null = use base price
is_available      BOOLEAN           -- Can hide item at this location
created_at        TIMESTAMP
```

#### `tables`
```
id                UUID PK
location_id       UUID FK → locations
label             TEXT              -- "Table 7", "Bar Seat 3", "Terrace A"
public_code       TEXT UNIQUE       -- Short random code (8 chars), used in QR URL instead of raw UUID
qr_code_url       TEXT              -- Generated QR pointing to customer URL
is_active         BOOLEAN
created_at        TIMESTAMP
```

#### `sessions`
```
id                UUID PK
table_id          UUID FK → tables
opened_at         TIMESTAMP
closed_at         TIMESTAMP         -- Null = active
closed_by         ENUM              -- staff | timeout
customer_name     TEXT              -- Soft identity
status            ENUM              -- active | closed
```

#### `orders`
```
id                UUID PK
session_id        UUID FK → sessions
table_id          UUID FK → tables  -- Denormalized for query convenience
location_id       UUID FK → locations
customer_name     TEXT
status            ENUM              -- pending | in_progress | ready | delivered | cancelled
cancel_reason     TEXT              -- Nullable. Set when status = cancelled (e.g. "out of stock")
notes             TEXT              -- Customer free-text note on the order
placed_at         TIMESTAMP
updated_at        TIMESTAMP
```

#### `order_items`
```
id                UUID PK
order_id          UUID FK → orders
item_id           UUID FK → items
item_name         TEXT              -- Snapshot at time of order (prices change)
item_price        DECIMAL(10,3)     -- Snapshot at time of order
quantity          INTEGER
subtotal          DECIMAL(10,3)
```

#### `table_events`
```
id                UUID PK
session_id        UUID FK → sessions
table_id          UUID FK → tables
type              ENUM              -- waiter_called | bill_requested | check_needed
resolved          BOOLEAN
resolved_by       UUID FK → staff
created_at        TIMESTAMP
```

`check_needed` is system-generated (not customer-triggered) — see [Session Lifecycle](#7-table--session-model) for when it fires.

#### `analytics_snapshots` *(generated daily, for fast dashboard queries)*
```
id                UUID PK
location_id       UUID FK → locations
date              DATE
total_orders      INTEGER
total_items_sold  INTEGER
revenue_estimate  DECIMAL(10,3)
top_items         JSONB             -- Array of { item_id, name, count }
peak_hour         INTEGER           -- 0-23
created_at        TIMESTAMP
```

---

## 5. Tenant & Location Model

### Progressive Location Disclosure

The location layer always exists in the data model. The UI conditionally hides it.

**Single location account:**
The account was created with one location (the default). The admin dashboard shows: Menu, Tables, Orders, Staff, Analytics. No "Locations" label, no location switcher, no location-related settings visible anywhere.

**Multi-location account (triggered when a second location is added):**
A "Locations" section appears in the sidebar. A location switcher appears at the top of all scoped views (Tables, Orders, Staff). Analytics gains a "Compare locations" view. The admin can now also assign staff to specific locations.

**How a second location is added:**
Settings → Plan & Billing → "Add a location" (only available on Business plan). This triggers the UI restructuring.

### Location Isolation

Data is always location-scoped at the query level. A kitchen staff member logged into Location A's KDS can never see or affect Location B's orders, even if both are under the same tenant.

**Enforcement:** this cannot rely on API route code alone — a single missed `WHERE location_id = ?` clause is a cross-tenant data leak. Supabase Postgres Row-Level Security (RLS) policies are enabled on every tenant-scoped table (`categories`, `items`, `tables`, `sessions`, `orders`, `order_items`, `table_events`, `staff`, `analytics_snapshots`), keyed off `tenant_id` / `location_id` matching the authenticated staff record. App-level filtering stays as the first line of defense for correctness and query efficiency; RLS is the backstop that makes a leak structurally hard even if a route forgets the filter.

---

## 6. Menu Architecture

### Structure

Brand → Categories → Items

Categories have a sort order and can be toggled visible/invisible. Items belong to a category and have all content in three languages (Arabic, French, English). The customer-facing menu renders in the diner's preferred language based on browser locale, with French as the fallback and a manual language toggle always visible.

### Content Management

The admin dashboard provides a full menu editor:

- Drag-and-drop category reordering
- Drag-and-drop item reordering within categories
- Inline price editing
- One-tap availability toggle (the most used action — make it prominent)
- Bulk availability toggle per category ("86 the entire pasta section")
- Image upload with automatic optimization via Supabase Storage
- Multi-language content fields (tab between AR / FR / EN)

### Location Overrides *(data model ready, UI deferred)*

The `location_item_overrides` table is created at launch. The UI to manage overrides (set a location-specific price, hide an item at one location) is built in a later version. At launch, all locations share the brand menu identically.

### Item Snapshots on Orders

When an order is placed, `item_name` and `item_price` are copied into `order_items` as a snapshot. This ensures historical orders remain accurate if an item is later renamed or repriced.

### Modifiers

Not in scope for launch. The data model does not include option groups or modifiers. A note field on the order ("no onions please") partially covers edge cases. Modifiers are a defined future feature — when added, they slot between `items` and `order_items` without restructuring the core schema.

---

## 7. Table & Session Model

### Table Setup

The owner creates tables in the dashboard, assigns a label (e.g. "Table 7", "Terrace B2", "Bar 3"), and the system generates a QR code for each. The QR encodes a URL:

```
https://menu.yourplatform.com/[tenant-slug]/table/[public_code]
```

`public_code` is a short (8-character) random code generated per table, not the raw table UUID. This keeps the encoded URL short (denser QR = more reliable scans from a slightly worn table tent, and shorter to type manually if someone reads it off instead of scanning), and avoids putting internal UUIDs or the location-id in a public-facing, printable artifact. The `location_id` and `table_id` are looked up server-side from `public_code` — a table's location is a property of the table, so it doesn't need to be repeated in the URL.

The QR code is downloadable as a print-ready PNG or SVG, sized for standard table tent cards. Printing and laminating is handled by the owner (or offered as a setup service by you).

### Session Lifecycle

A session represents one group's stay at a table from arrival to departure.

```
Session OPEN
  → Multiple orders can be placed within the session
  → Waiter calls and bill requests are logged to the session
Session CLOSED
  → Staff taps "Clear table" (dashboard Tables page for now — moves to the floor staff app once built, see section 9)
  → OR session auto-closes after [timeout] minutes of zero activity
```

**Default timeout:** 150 minutes (2.5 hours), configurable per location in Settings between 60 and 480 minutes.

**When a new group scans the QR of a table with an active session:**
The system checks the session status. If the previous session is closed (staff cleared it), a new session is created automatically.

If the session is still active (staff forgot to clear, or genuinely a new arrival at a table someone else is still sitting at), the scanner sees a confirmation prompt before landing on the menu: **"Are you with [customer_name]?"** — Yes / No.

- **Yes** → they join the existing session as before. If they have no session cookie (new device), they're still asked their own name so their individual orders are attributed correctly, even though they share the session.
- **No** → the platform still can't cleanly split one table into two concurrent sessions (see [Split Sessions](#17-future-considerations) below for why), so this doesn't create a second session either. Earlier revisions of this flow folded a "No" answer into the existing session anyway (just with a staff alert) to avoid leaving the scanner with nothing to do — but that meant two unrelated parties' orders and bill could still end up merged, which is worse than the ambiguity it was trying to solve. Instead, "No" logs a `check_needed` table event and blocks the scanner from ordering, showing a "we've let staff know, try again shortly" screen rather than the menu. **Clear table** (below) is what unblocks it — either the specific staff action or the timeout.

This entirely replaces the old silent-merge behavior — a mismatched scan is now always flagged to staff, and never quietly folded into a bill it doesn't belong to, in either direction.

**Session ID in URL:**
The customer URL does not expose the session ID. Session binding happens server-side when the customer submits their name and the system checks for an active session on that table.

### Customer Soft Identity

When a diner scans and lands on the menu for the first time in a session, a lightweight prompt appears before they can order: **"What's your name?"** — a single text field. This is not a login wall. It takes three seconds and attaches a name to all orders from that device for that session.

A session cookie keeps them identified for the remainder of the session on the same device. If they close and reopen the browser, the name prompt reappears.

The name serves:
- Order attribution on the KDS ("Sarah — Table 7")
- Waiter recognition ("bill request from Mohamed, Table 3")
- Future loyalty system foundation

---

## 8. Order Lifecycle

### States

```
PENDING → IN_PROGRESS → READY → DELIVERED
   │            │
   └────────────┴──→ CANCELLED
```

An order can only be cancelled from `PENDING` or `IN_PROGRESS` — once it's `READY` it exists in the physical world and cancelling it on-screen doesn't un-cook it.

And three parallel table-level event types (not order states):
```
WAITER_CALLED
BILL_REQUESTED
CHECK_NEEDED     -- system-generated, see Session Lifecycle
```

### State Transitions

| Transition | Who triggers | Where |
|---|---|---|
| → PENDING | Customer places order | Customer menu |
| PENDING → IN_PROGRESS | Kitchen staff taps order | KDS |
| IN_PROGRESS → READY | Kitchen staff marks done | KDS |
| READY → DELIVERED | Floor staff taps confirm | Floor staff app |
| PENDING/IN_PROGRESS → CANCELLED | Kitchen staff taps "Cancel" + picks a reason | KDS |
| WAITER_CALLED created | Customer taps "Call Waiter" | Customer menu |
| WAITER_CALLED resolved | Floor staff taps resolve | Floor staff app |
| BILL_REQUESTED created | Customer taps "Request Bill" | Customer menu |
| BILL_REQUESTED resolved | Floor staff taps resolve | Floor staff app |
| CHECK_NEEDED created | System, on a mismatched session-join scan | Server-side |
| CHECK_NEEDED resolved | Floor staff taps resolve | Floor staff app |

### Order Cancellation

Cancelling is kitchen-initiated only in V1 (customers can't self-cancel — if they want to change an order, they call the waiter). On cancel, kitchen picks a short reason from a fixed set (`out_of_stock`, `kitchen_error`, `other`), stored in `orders.cancel_reason`. A cancelled order:
- Leaves the KDS queue immediately
- Pushes an alert to the floor staff feed ("Table 7's order was cancelled — [reason]") so the waiter can go explain it to the customer, since the customer has no way to see this on their own screen in V1
- Is excluded from the session's running total (see below) and from `analytics_snapshots` revenue figures

### Order Submission Validation

Because item availability can change in real time (an owner or kitchen staff toggles something out mid-service) while a customer's cart was built earlier from a menu snapshot in their browser, the server re-checks every item's `is_available` status at the moment an order is submitted — not just when the item was added to the cart. If one or more cart items became unavailable in the meantime, those lines are rejected with a clear message ("Croissant is no longer available") and the rest of the order still goes through if anything remains valid. The customer isn't silently charged or served for something the kitchen can't make.

### Session Bill Total

`BILL_REQUESTED` tells staff a table wants to pay, but nothing upstream of this computed an actual number for them to act on — since payment happens at the cashier, not in-app, the waiter or cashier still needs a total to work from. The session's running total is a simple computed value, not a stored field: sum of `subtotal` across all `order_items` belonging to non-cancelled orders in the session. It's shown:
- On the floor staff feed card itself when a `BILL_REQUESTED` alert appears
- In the session-history tab, per active session, updating live as new orders come in

This total is informational for staff, not a payment record — actual payment still happens entirely at the cashier, consistent with the platform's cash-first design (see [Core Principles](#2-core-principles)).

### Multiple Orders Per Session

A single session contains multiple orders. A customer can place a new order at any point — drinks first, food later, extra item after — without starting over. Each order is independent in the queue. The KDS shows all orders grouped by table, ordered by placement time.

### Order Notes

A free-text field on the order ("no onions", "extra sauce") is included at launch as a lightweight substitute for modifiers. The field is optional and visible on the KDS card.

### Order Display on KDS

Each order card on the KDS displays:
- Table label (large, prominent)
- Customer name
- Time since order was placed (live counter, turns red after threshold)
- Items list with quantities
- Notes field if present
- Action button: "Start" → "Done"

Cards are sorted: PENDING first (red border), then IN_PROGRESS (yellow border), then READY (green border, fading to off-queue). DELIVERED orders leave the KDS view.

---

## 9. The Five Interfaces

### 9.1 Customer Menu

**Device:** Mobile browser (primary), any browser (secondary)  
**URL:** `menu.yourplatform.com/[tenant-slug]/[location-id]/table/[table-id]`  
**Auth:** None  
**Language:** Auto-detected from browser, manual toggle always available (AR / FR / EN)

#### Flow

1. Customer scans QR → lands on menu page
2. If no active session: session is created server-side, name prompt appears
3. Customer enters name → dismissed, menu is now fully accessible
4. Customer browses categories and items (photos, descriptions, prices in TND)
5. Customer taps item → added to cart (floating cart button shows count + total)
6. Customer reviews cart → taps "Place Order" → order submitted
7. Confirmation appears ("Your order is on its way!")
8. Customer can place additional orders at any time
9. Customer can tap "Call Waiter" at any time → floor staff notified
10. Customer can tap "Request Bill" → floor staff notified

#### UI Design Notes

- Category navigation is a horizontal scrollable tab bar at the top
- Items displayed as cards with image (if uploaded), name, description (truncated), price
- Cart is a floating bottom bar, always visible when cart has items
- AI chat bubble appears in bottom-right corner (if tenant is on AI tier)
- The entire color scheme, typography, and logo reflect the restaurant's brand theme
- RTL layout activates automatically when Arabic is selected
- No platform branding visible on customer-facing pages ("white-label by default")

---

### 9.2 Admin Dashboard

**Device:** Desktop-first, tablet-friendly  
**URL:** `app.yourplatform.com/dashboard`  
**Auth:** Better Auth (email + password), owner or location manager role

#### Sidebar Navigation

Shown to single-location owner:
```
My Restaurant
─────────────
Menu
Tables & QR Codes
Orders (live)
Staff
Analytics
─────────────
Settings
Plan & Billing
```

Shown to multi-location owner (unlocked on second location creation):
```
[Brand Name]    [Location Switcher ▼]
─────────────────────────────────────
Locations
Menu
Tables & QR Codes
Orders (live)
Staff
Analytics
─────────────────────────────────────
Settings
Plan & Billing
```

#### Key Sections

**Menu**
Full menu editor. Categories and items. Drag to reorder. Inline editing. Availability toggles. Image uploads. Multi-language tabs per item. One-click "mark unavailable" button on each item card for during-service use.

**Tables & QR Codes**
Grid of all tables. Each shows label, current session status (active / idle), and a download button for the QR code. Add/rename/deactivate tables. Link to print-ready QR export (single table or all tables as a PDF sheet).

**Orders (live)**
A read-only real-time view of all current orders across all active sessions for this location. Grouped by table. Shows order statuses. Useful for the owner to monitor service without being in the kitchen or floor. Not the primary operational interface (that's KDS and floor app).

**Staff**
List of staff accounts. Add new staff (name, email, role: kitchen / floor). Role determines which interface they see on login. Deactivate accounts. For multi-location accounts, assign staff to specific location(s).

**Analytics**

Single-location view includes:
- Today's order count and estimated revenue
- Orders over time chart (7d / 30d / 90d)
- Top 5 items by order count
- Peak hour heatmap
- Average order value
- Table turnover rate

Multi-location view adds:
- Location comparison
- Cross-location top items

AI Analytics assistant (Business tier): a chat interface in the analytics section where the owner types natural language questions.

**Settings**
- Restaurant info (name, address, logo, brand colors)
- AI theme generator (Pro+ tier)
- Session timeout configuration
- Notification preferences
- Language defaults

**Plan & Billing**
Current plan, renewal date, invoice history. Upgrade/downgrade options. This is the only place in the dashboard where plan tiers are mentioned or referenced.

---

### 9.3 Kitchen Display System (KDS)

**Device:** Dedicated tablet or monitor in the kitchen (set up once, never touched)  
**URL:** `app.yourplatform.com/kds/[location-id]`  
**Auth:** Better Auth, kitchen role  
**Design constraint:** Readable from 2 meters, operable with one greasy finger

#### UI

Full-screen, always-on view. Dark background (reduces eye strain in bright kitchen lighting).

Layout: responsive card grid. Each card is one order.

Card anatomy:
```
┌─────────────────────────────┐
│  TABLE 7          0:04 ago  │
│  Mohamed                    │
├─────────────────────────────┤
│  2× Café au lait            │
│  1× Croissant               │
│  Note: no butter            │
├─────────────────────────────┤
│  [ START ORDER ]   [Cancel] │
└─────────────────────────────┘
```

"Cancel" is a small secondary action, deliberately less prominent than "Start Order" — tapping it opens a one-tap reason picker (out of stock / kitchen error / other) before confirming, so it can't be hit by accident with a greasy thumb. Once an order is `IN_PROGRESS`, "Cancel" is still available (kitchen can still bail on something they've started); once it's `READY`, "Cancel" disappears — see [Order Cancellation](#8-order-lifecycle).

After tapping "Start Order" the card changes:
```
┌─────────────────────────────┐
│  TABLE 7          0:07 ago  │  ← yellow border
│  Mohamed                    │
├─────────────────────────────┤
│  2× Café au lait            │
│  1× Croissant               │
│  Note: no butter            │
├─────────────────────────────┤
│  [ MARK READY ]     [Cancel]│
└─────────────────────────────┘
```

After "Mark Ready" the card turns green briefly and exits the queue.

Time counter turns amber at 10 minutes, red at 15 minutes (thresholds configurable in settings).

No other UI. No navigation. No settings visible. The URL is set by the owner once during setup.

---

### 9.4 Floor Staff App

**Device:** Staff's personal mobile phone  
**URL:** `app.yourplatform.com/floor/[location-id]`  
**Auth:** Better Auth, floor staff role  
**Design constraint:** Glanceable, one-handed, fast to action

#### UI

A live feed of things that need the waiter's attention. Sorted by urgency (age).

Four types of feed items:

```
🟢  ORDER READY          — Table 7 · Mohamed · 2m ago
    [CONFIRM DELIVERED]

🔔  WAITER CALLED        — Table 3 · Anis · just now
    [RESOLVE]

💳  BILL REQUESTED       — Table 11 · 5m ago · Total: 47.500 TND
    [RESOLVE]

⚠️  CHECK TABLE 5        — new scan didn't match current guest · 1m ago
    [RESOLVE]

🍽  ORDER CANCELLED       — Table 9 · out of stock · just now
    [ACKNOWLEDGE]
```

`BILL REQUESTED` cards always show the session's running total (see [Session Bill Total](#8-order-lifecycle)) so the waiter doesn't have to go look it up elsewhere before heading to the table. `CHECK TABLE` is the system-generated alert from a mismatched session-join scan — resolving it is a judgment call for staff (split the table, clear it, or dismiss if it was a false alarm). `ORDER CANCELLED` surfaces kitchen-initiated cancellations so the waiter knows to go explain it to the customer before they wonder where their order went.

Each item has one action button. Tapping it removes it from the feed and logs it as resolved.

When the feed is empty: a clean "All clear" state. No pending actions.

A secondary tab shows all active sessions, their order histories, and each session's running total (same computed value as on the `BILL REQUESTED` card) — useful both for context if a customer has a question about their order status, and for staff to check a table's total proactively even before a bill is formally requested.

**Clear Table** button is accessible per table in this secondary view. Tapping it prompts a single confirmation: "Close session for Table 7?" → Yes / No.

> **Status:** `DELETE /api/sessions/[id]` (the close-session action this button calls) and a Clear Table button exist today, pulled forward from this task since the "Are you with [name]? → No" flow (section 7) needed a real resolution path. It currently lives on the owner/manager Tables dashboard rather than this feed, since the feed itself isn't built yet. When this section is implemented, move the button here and retire the dashboard one (or keep both — dashboard for a quick global glance, feed for the floor workflow). Note also that `CHECK TABLE` is no longer purely informational: the customer who triggered it is blocked from ordering until this is resolved, not just quietly seated under the existing session, so treat these as higher-urgency than the description above implies.

---

### 9.5 Super Admin Panel

**Device:** Desktop  
**URL:** `app.yourplatform.com/superadmin`  
**Auth:** Better Auth, super_admin role (separate from tenant roles, hardcoded to your account)

#### Sections

**Tenants**
Full list of all registered tenants. Search by name/slug. Filter by plan. Click into any tenant to see their full account state: locations, staff count, order volume, current plan, payment status.

**Impersonation**
"View as tenant" button on any tenant. Opens their dashboard as if you were the owner. Critical for support. Logged in audit trail.

**Analytics**
Platform-wide metrics: total tenants, active tenants (placed at least one order in last 30 days), total orders processed, MRR estimate by plan tier.

**Subscriptions**
Manually override plan tier for any tenant (for trials, grace periods, special deals). Set expiry dates. Mark accounts as suspended.

**Audit Log**
Record of all super admin actions: impersonations, plan overrides, suspensions.

---

## 10. Notification System

### Design Philosophy

The KDS and floor staff interfaces are designed to be **kept open during service**, not checked. Notifications are therefore in-app sound + visual — not push notifications. Push notifications require browser permission prompts, have inconsistent cross-device behavior, and create dependency on service workers. This is deliberately avoided in V1.

**Operational expectation:** During service, the KDS is on the kitchen screen and the floor staff app is open on the waiter's phone. This mirrors how every other restaurant tool works (Deliveroo tablet, cash register screen, etc.).

### Sound Design

Two distinct sounds:

**Kitchen chime** — played on the KDS when a new order arrives (PENDING state created)
Short, clear, neutral tone. Loops every 30 seconds until the order is acknowledged.

**Floor alert** — played on the floor staff app when a new item appears in the feed (order ready, waiter called, bill requested)
Slightly different tone from the kitchen chime, so trained staff can distinguish them without looking.

Both sounds are played using the Web Audio API (no external dependency). Volume is controllable in the interface settings.

### Fallback

If a staff member closes their browser or the tab loses focus, they miss real-time events. The safety net is: all unresolved items remain in the feed when they return. Nothing is silently dropped.

Push notifications are a defined V2 feature for the floor staff app specifically (kitchen staff should never close the KDS).

---

## 11. AI Features (V2 — not part of V1)

None of this section is built in V1 (see [MVP Scope](#16-mvp-scope)). It's documented here so the schema and plan tiers are designed with it in mind from day one, not because any of it needs to work before the first paying customer. Treat everything below as a spec for later, not a build list for now.

All AI features are gated behind plan tiers. Accounts not on an eligible tier never see these features anywhere in the UI — not even as locked/greyed-out elements. The only place AI tiers are mentioned is the Plan & Billing page.

**LLM provider:** TBD, not Groq. Groq's public API currently exposes chat completions but no embeddings endpoint, which the RAG-based chatbot (11.2, 11.3) needs. When this is picked up, either choose a provider that offers both chat and embeddings on a free/cheap tier (e.g. Together AI, Cohere), or split the two: Groq (or similar) for fast chat inference, a separate provider for embeddings. For a menu-sized knowledge base (a few dozen items), it may also be simplest to skip embeddings and vector search entirely and just pass the full menu as context on every chat call — worth evaluating before building the RAG pipeline described below.

**Guardrails:** the customer-facing chatbot (11.2) is public, unauthenticated, and white-labeled to look like the restaurant is speaking — anyone at the table can try to make it go off-script for fun, and a jailbroken response looks like it came from the restaurant, not from Anthropic or a generic bot. Beyond the system-prompt scoping described below, this needs an actual moderation/prompt-injection layer before launch (e.g. a guard model pass on both the user's message and the model's response, or a provider with built-in moderation), not just prompt instructions asking the model to behave.

### 11.1 AI Menu Theming

**Tier:** Pro and above  
**Where:** Admin Dashboard → Settings → Appearance  
**Model:** LLM provider TBD (V2) — see note in section 11 header

#### What it does

The owner provides:
- Their logo (image upload)
- One or two brand colors (color picker)
- A vibe keyword: "cozy", "modern", "traditional", "minimalist", "luxury", "playful"

The AI analyzes the inputs and selects from a set of 6–8 pre-built base themes, then produces a `theme_config` JSON object that customizes it: color tokens (primary, secondary, accent, background, surface, text), font pairing (from a curated safe set loaded via Google Fonts), border radius values, card style, and button style.

The output is applied to the customer-facing menu and previewed live in the dashboard before the owner saves it.

The owner can also manually tweak any individual token after generation (e.g. they like the AI's theme but want a slightly different button color). Manual tweaks are saved separately and preserved on regeneration.

#### Example output

```json
{
  "base_theme": "warm-minimal",
  "colors": {
    "primary": "#C8622A",
    "secondary": "#F5EDD8",
    "accent": "#2A4A3A",
    "background": "#FDFAF5",
    "surface": "#FFFFFF",
    "text_primary": "#1A1A1A",
    "text_secondary": "#6B6B6B"
  },
  "typography": {
    "heading_font": "Playfair Display",
    "body_font": "Inter",
    "heading_weight": "700",
    "body_weight": "400"
  },
  "radius": "8px",
  "card_style": "elevated",
  "button_style": "rounded"
}
```

---

### 11.2 Customer Menu Chatbot

**Tier:** Pro and above  
**Where:** Customer-facing menu page (chat bubble, bottom-right)  
**Model:** LLM provider TBD (V2) + RAG on menu data  
**Context:** Per-restaurant, scoped knowledge only

#### What it does

A diner can open the chat and ask natural language questions about the restaurant's menu. The AI answers from the menu data only — it does not have general knowledge in this context.

Example questions it handles:
- "What's vegetarian here?"
- "What do you recommend if I like spicy food?"
- "Does the tagine have gluten?"
- "What's the most popular dessert?"
- "What's cheapest on the menu?"
- "What comes with the mixed grill?"

#### RAG Implementation

The restaurant's full menu (all categories, items, descriptions, prices, availability) is embedded at menu-save time and stored in a vector column on `items` (schema change to be added when this ships — not present in the V1 schema in section 4). On each customer query, the top-K most relevant item chunks are retrieved and injected into the LLM prompt as context. As noted above, given a typical menu's size, a simpler no-embeddings approach (full menu in context every call) should be evaluated as an alternative before committing to this pipeline.

The system prompt instructs the model to:
- Only answer questions about this restaurant's menu
- Politely decline questions outside that scope
- Always mention prices in TND
- Respond in the same language the customer used (Arabic / French / English)
- Not hallucinate items that aren't in the provided context

The chat widget is visually styled to match the restaurant's theme (inherits `theme_config` colors).

Embeddings are regenerated automatically whenever the menu is saved.

---

### 11.3 Owner Analytics Chatbot

**Tier:** Business only  
**Where:** Admin Dashboard → Analytics → "Ask your data" tab  
**Model:** LLM provider TBD (V2) + RAG on analytics data  
**Context:** Per-tenant, scoped to their own data

#### What it does

The owner types natural language questions about their business performance. The AI answers from their actual order and analytics data.

Example questions it handles:
- "What was my best-selling item last week?"
- "How did this Tuesday compare to last Tuesday?"
- "Which table generates the most orders?"
- "What time of day is slowest?"
- "How many orders did we do in June?"
- "What items haven't been ordered in the last 30 days?" (useful for menu pruning)

#### Implementation

At query time, relevant analytics data is fetched from `analytics_snapshots` and recent `orders` / `order_items`, formatted as structured context, and injected into the LLM prompt. No vector search needed here — the data is structured and can be fetched by query parameters derived from the question.

The system prompt instructs the model to:
- Only reference data from this tenant's account
- Be direct and specific in answers (no vague generalities)
- Suggest actions when appropriate ("Item X hasn't been ordered in 3 weeks — consider removing it or featuring it")
- Respond in the owner's dashboard language preference

---

## 12. Subscription Tiers & Progressive Disclosure

### Tiers

| | Starter | Pro | Business |
|---|---|---|---|
| **Price** | Free | ~80–120 TND/mo | ~200 TND/mo |
| **Locations** | 1 | 1 | Unlimited |
| **Tables** | Up to 10 | Up to 30 | Unlimited |
| **Live ordering** | ❌ (menu only) | ✅ | ✅ |
| **KDS** | ❌ | ✅ | ✅ |
| **Floor staff app** | ❌ | ✅ | ✅ |
| **Basic analytics** | ✅ | ✅ | ✅ |
| **Advanced analytics** | ❌ | ✅ | ✅ |
| **AI menu theming** | ❌ | ✅ | ✅ |
| **Customer AI chatbot** | ❌ | ✅ | ✅ |
| **Owner analytics chatbot** | ❌ | ❌ | ✅ |
| **Multi-location** | ❌ | ❌ | ✅ |
| **Location overrides** | ❌ | ❌ | ✅ |

### The Starter Play

Starter being free (digital menu only, no live ordering) is a deliberate land-and-expand strategy. The owner gets a working digital menu with their branding at zero cost. They see customers using it. They start wanting orders to flow to the kitchen without a waiter relay. They upgrade to Pro. This is an easier conversation than selling Pro cold.

### Progressive Disclosure Rules

1. Features not on the current plan are simply absent from the UI. No lock icons, no "upgrade to unlock" banners, no greyed-out buttons in the main flow.
2. The only place plan differences are visible is the **Plan & Billing** page, which lists all tiers and their features.
3. Multi-location UI is hidden until a second location exists.
4. AI features UI is hidden until the plan supports it.
5. Location Manager role is hidden from staff role dropdown until multi-location is active.

---

## 13. Tech Stack

All services have generous free tiers. The stack costs nothing until there are paying customers.

This is the **V1 stack** — no AI/LLM layer is included, since AI features are entirely out of scope for V1 (see [MVP Scope](#16-mvp-scope)).

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend framework** | Next.js 14 + TypeScript | Single codebase for all 5 interfaces. SSR for customer menu (fast QR-to-load). App Router. |
| **Styling** | Tailwind CSS | Utility-first, no runtime overhead, easy theme token injection |
| **Database** | Supabase (PostgreSQL) | Managed Postgres, RLS for tenant isolation, real-time subscriptions, storage — all in one |
| **Real-time** | Supabase Realtime | WebSocket-based, built into Supabase, no additional service needed |
| **Auth** | Better Auth | Free and open source forever, handles multi-role, sessions, JWT. Self-hosted. |
| **File storage** | Supabase Storage | Menu item photos, logos. 1GB free tier. CDN-backed. |
| **Caching** | Upstash Redis | Serverless Redis. Free tier. Used for rate limiting and session caching. |
| **Frontend deployment** | Vercel | Free tier. Next.js-native. Edge functions for API routes. |
| **Backend deployment** | Vercel (API routes) | Next.js API routes handle backend logic, no separate server needed at MVP stage |
| **QR generation** | `qrcode` npm package | Client-side generation. Free. SVG + PNG output. |
| **Email** | Resend | Free tier (100 emails/day). Staff invitations, owner notifications. |

**Deferred to V2 (AI features):** LLM provider TBD + pgvector (or a no-embeddings context-stuffing approach — see section 11) once AI features are actually built.

### Why No Separate Backend Server

Next.js API routes + Supabase covers everything needed for MVP. There's no WebSocket server to manage — Supabase Realtime handles it. This simplifies deployment to a single Vercel project. If scale demands it, a separate Node.js service (Railway) can be extracted later without touching the frontend.

### Environment Separation

```
Development:  localhost:3000 + Supabase local emulator
Staging:      staging.yourplatform.com (Vercel preview)
Production:   yourplatform.com + app.yourplatform.com + menu.yourplatform.com
```

Customer-facing menus live on `menu.yourplatform.com` — separated from the app subdomain to allow independent theming and to keep customer-facing pages clean.

---

## 14. System Architecture Diagram

This is the **V1 diagram** — the `/api/ai/*` routes and the LLM box are V2 additions, shown here dotted to indicate they don't exist yet.

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                              │
│  menu.yourplatform.com        app.yourplatform.com           │
│  ┌───────────────────┐        ┌──────────────────────────┐   │
│  │  Customer Menu    │        │  Admin Dashboard         │   │
│  │  (Next.js SSR)    │        │  KDS (/kds/[id])         │   │
│  │  No auth          │        │  Floor App (/floor/[id]) │   │
│  │  Theme-injected   │        │  Super Admin             │   │
│  └────────┬──────────┘        └───────────┬──────────────┘   │
└───────────┼───────────────────────────────┼──────────────────┘
            │                               │
            │         HTTPS + WSS           │
            ▼                               ▼
┌──────────────────────────────────────────────────────────────┐
│                      NEXT.JS API LAYER                       │
│                    (Vercel Edge Functions)                    │
│                                                              │
│   /api/menu        /api/orders      /api/sessions            │
│   /api/tables      /api/staff       /api/analytics           │
│   /api/events      /api/tenants     /api/admin               │
│   ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│   ┊ /api/ai/theme    /api/ai/chat    /api/ai/insights   (V2) │
└──────────────────────────────────────────────────────────────┘
            │                               │
     ┌──────┴──────┐                 ┌──────┴──────┐
     ▼             ▼                 ▼             ▼
┌─────────┐  ┌──────────┐     ┊┄┄┄┄┄┄┄┄┄┄┊  ┌──────────┐
│Supabase │  │ Supabase │     ┊  LLM API ┊  │ Upstash  │
│Postgres │  │ Realtime │     ┊ (provider┊  │  Redis   │
│+ RLS    │  │(WebSocket│     ┊  TBD, V2)┊  │ (cache + │
│+ Storage│  │  relay)  │     ┊┄┄┄┄┄┄┄┄┄┄┊  │  limits) │
└─────────┘  └──────────┘                  └──────────┘
```

### Real-time Event Flow

```
Customer places order
        │
        ▼
POST /api/orders → Insert into DB
        │
        ▼
Supabase Realtime broadcasts INSERT event on `orders` table
        │
        ├──→ KDS (subscribed to orders for this location) → new card appears + chime
        │
        └──→ Admin live orders view → order appears
```

```
Kitchen marks order READY
        │
        ▼
PATCH /api/orders/[id] → Update status in DB
        │
        ▼
Supabase Realtime broadcasts UPDATE event
        │
        └──→ Floor staff app (subscribed to orders + events) → new feed item + alert sound
```

---

## 15. Business Model

### Pricing Strategy

**Setup fee (one-time):** 200–400 TND per restaurant  
Covers: in-person menu setup, QR code printing and lamination, staff walkthrough, first-month support. This is a service, not just software activation. It filters out non-serious leads and compensates for your time.

**Monthly subscription:** Tiered (see section 12)  
Invoiced monthly. Paid by bank transfer (standard for Tunisian B2B). No payment gateway needed on your end at this stage.

### The Sales Process

1. Walk into a café or restaurant
2. Show a live demo on your phone — scan a QR, see a menu, place an order
3. Show the kitchen view — watch the order appear in real time
4. One-line pitch: *"Your waiters spend half their time taking orders and running to the kitchen. This eliminates that. Orders go directly, staff focuses on service, customers don't wait."*
5. Close on a trial: "Let me set it up for you this week, free for the first month."
6. Setup visit: configure their menu with them, print QRs, show staff the kitchen screen and floor app (10 minutes each)
7. They go live. Follow up after 2 weeks. Convert to paid.

### Expansion Path

- Direct sales in Tunis → Sfax → Sousse
- Referrals: a working installation in one café is the best advertisement to the café next door
- Self-serve signup (later): marketing site, online sign-up, automated onboarding for owners who don't need hand-holding
- Partnership with restaurant POS providers (later)

---

## 16. MVP Scope

What must be built before the first paying customer:

### Must Have (V1)

- Tenant signup and onboarding flow
- Menu editor (categories, items, images, prices, availability toggle)
- Table creation and QR code generation + download
- Customer menu (name prompt, browse, cart, order, call waiter, request bill)
- KDS (live order queue, start/done actions, sounds)
- Floor staff app (live feed, resolve actions, clear table)
- Better Auth (owner + kitchen + floor roles)
- Supabase Realtime (order events)
- Basic analytics (today's orders, top items)
- Session management with timeout
- "Are you with [name]?" confirmation on session-join scans, plus the `check_needed` staff alert when declined
- Order cancellation (kitchen-initiated, with reason), surfaced to floor staff
- Server-side item-availability re-validation on order submission
- Session running total, shown on bill-request alerts and the floor app's session tab
- Row-Level Security policies on all tenant-scoped tables
- Starter and Pro tiers enforced
- Super admin panel (tenant list, plan override)
- Arabic + French language support on customer menu

### Out of Scope for V1

- Multi-location UI (data model ready, UI deferred)
- Location overrides
- AI features (all three)
- Business tier
- Push notifications
- Modifier/option groups
- Online payment
- Loyalty programs
- Self-serve billing / Monetique Tunisie integration
- Mobile apps (native iOS/Android)
- Printer integration (KDS covers this use case digitally)

---

## 17. Future Considerations

These are not planned but should not be designed against:

**Modifiers / Option Groups**
When added, they slot between `items` and `order_items`. The schema is deliberately left open for this. The customer cart UI and KDS order card will need to accommodate them.

**Online Payment**
Monetique Tunisie integration for card payment at the end of a session. The session and order models already accumulate the data needed to compute a bill total. Payment state is added as a field on sessions.

**Loyalty System**
Customer soft identity (name + session cookie) is the seed. A proper loyalty system requires phone number or email verification. Designed to layer on top of the existing identity model.

**Native Mobile Apps**
The floor staff app is a PWA candidate first. If staff consistently run into browser limitations (background sound, push notifications), a React Native wrapper is the path.

**Printer Integration**
ESC/POS thermal printer integration for kitchens that prefer paper tickets. The order event model already supports this — it's a listener that formats and sends to a local printer IP.

**Location Overrides UI**
The data model (`location_item_overrides`) is built at launch. The management UI (set location-specific price, hide item at one location) is built when a Business tier customer requests it.

**Multi-language Menu Content**
Arabic, French, and English fields exist on all content entities from day one. The translation workflow (auto-translate via AI on content entry) is a V2 quality-of-life feature.

**Reservation System**
Table booking integrated with session management. Out of scope for this product version but a natural extension.

**Split Sessions (true multi-party-per-table)**
V1's "Are you with [name]?" flow (section 7) detects a mismatched session-join scan and flags it to staff, but doesn't actually split one table into two concurrent sessions — the data model is one-active-session-per-table. If this turns out to be a common real case (e.g. bar seating where unrelated parties share a table) rather than a rare edge case, a proper fix means allowing multiple concurrent sessions per table, each bound to their own subset of orders, with the QR-scan flow prompting the diner to pick which session they're joining (or start a new one) instead of just yes/no. Bigger schema change — not undertaken until the flagged-alert version proves insufficient in practice.

**AI Chatbot Moderation Layer**
When the customer-facing AI chatbot (section 11.2) is built, it needs a real prompt-injection/moderation layer, not just system-prompt instructions — see the guardrails note in section 11.

---

*End of document.*
