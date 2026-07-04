# Project Overview

## About the Project

Sarbi is a multi-tenant SaaS platform that enables cafés and restaurants in Tunisia to deploy QR-based digital menus and table ordering systems with zero hardware. Customers scan a QR code on their table, browse the menu in Arabic, French, or English, and place orders directly from their phone browser. Orders flow in real time to a kitchen display and floor staff feed. Payment remains at the cashier.

---

## The Problem It Solves

Restaurants in Tunisia rely on physical menus (printing, reprinting, laminating), verbal order-taking by waiters, and paper order tickets relayed from floor to kitchen. This is slow, error-prone, and wastes staff time on order relay instead of service. Sarbi replaces all of that with a digital flow: customer scans QR → places order → kitchen sees it instantly → floor staff gets notified when it's ready. No special hardware, no app download, no payment gateway integration needed.

---

## Pages / Screens

| Screen | URL Pattern | Auth | Device |
|---|---|---|---|
| Customer Menu | `/[tenantSlug]/table/[publicCode]` | None | Mobile (primary) |
| Admin Dashboard | `/dashboard` | Supabase Auth (owner, location_manager) | Desktop / tablet |
| Kitchen Display System | `/kds/[locationId]` | Supabase Auth (kitchen) | Dedicated screen |
| Floor Staff App | `/floor/[locationId]` | Supabase Auth (floor) | Staff mobile phone |
| Super Admin Panel | `/superadmin` | Supabase Auth (super_admin) | Desktop |
| Login | `/login` | — | Any |

---

## Core User Flow

### Customer
1. Scan QR code on table → land on menu page
2. Enter name (soft identity prompt)
3. Browse categories, tap items to add to cart
4. Review cart → Place Order
5. Order appears on kitchen screen in real time
6. Can place additional orders, call waiter, or request bill at any time

### Owner
1. Sign up → create restaurant profile
2. Build menu (categories, items, images, prices, availability)
3. Create tables → system generates QR codes → download and print
4. Monitor live orders from dashboard
5. View analytics (today's orders, top items, peak hours)

### Kitchen Staff
1. Log in → see live order queue (KDS)
2. Tap "Start" when cooking begins
3. Tap "Done" when order is ready
4. Can cancel with reason (out of stock, kitchen error, other)

### Floor Staff
1. Log in → see live feed (order ready, waiter calls, bill requests, check alerts)
2. Tap action buttons to resolve items
3. View session history with running totals
4. Clear table when party leaves

---

## Features In Scope (V1)

- Tenant signup and onboarding flow
- Menu editor (categories, items, images, prices, availability toggle, drag reorder)
- Table creation + QR code generation + download (PNG/SVG)
- Customer menu (name prompt, browse, cart, order, call waiter, request bill)
- Starter tier: browse only, no ordering
- KDS (live order queue, start/done/cancel with reason, time counter, sounds)
- Floor staff app (live feed + session history with running totals + clear table)
- Supabase Auth (owner, kitchen, floor, super_admin roles)
- Supabase Realtime for order and event updates
- Basic analytics (today's orders, top items, peak hours)
- Session management with configurable timeout (default 150 min)
- "Are you with [name]?" session-join confirmation + check_needed staff alert
- Order cancellation (kitchen-initiated, with reason), surfaced to floor staff
- Server-side item availability re-validation on order submit
- Session running total on bill-request alerts and floor app session tab
- Row-Level Security on all tenant-scoped tables
- Starter + Pro tiers enforced
- Super admin panel (tenant list, plan override, impersonation)
- Arabic + French language support on customer menu

---

## Features Out of Scope (V1)

- Multi-location UI (data model ready, UI deferred)
- Location item overrides UI
- AI features (menu theming, customer chatbot, analytics chatbot)
- Business tier
- Push notifications
- Modifier/option groups
- Online payment
- Loyalty programs
- Self-serve billing / Monetique Tunisie integration
- Native mobile apps
- Printer integration

---

## Target User

A Tunisian café or restaurant owner (or manager) who wants to eliminate physical menus and waiter order-relay with zero hardware investment. Sells face-to-face, sets up on-site, processes cash payments at the cashier. Comfortable with basic web tools but not technical.

---

## Success Criteria

- Owner can sign up, create a menu with categories and items, add tables, and generate downloadable QR codes
- Customer scans QR, sees a themed menu in their language, places an order
- Order appears on the kitchen display in real time with a sound alert
- Kitchen staff can start, complete, and cancel orders with reasons
- Floor staff sees a live feed of order-ready notifications, waiter calls, and bill requests
- Session auto-closes after configurable timeout
- RLS prevents any cross-tenant data access
- Starter tier shows menu only with no ordering capability
- Arabic and French toggle works on customer menu with RTL layout for Arabic
