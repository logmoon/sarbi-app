# Architecture

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | Single codebase, 5 interfaces, SSR for customer menu |
| Styling | Tailwind CSS | Utility-first, theme token injection via CSS variables |
| Database | Supabase (PostgreSQL) | Managed Postgres, RLS for tenant isolation |
| Auth | Supabase Auth | Email/password, JWT with custom role claims, session management |
| Real-time | Supabase Realtime | WebSocket broadcast for order and event updates |
| Storage | Supabase Storage | Menu item photos, logos, QR code files |
| Cache | Upstash Redis | Rate limiting, session caching |
| Deployment | Vercel | Frontend + API routes, edge functions |
| Email | Resend | Staff invitations, owner notifications |
| QR Generation | `qrcode` npm package | Client-side SVG + PNG output |

---

## Folder Structure

```
/
├── app/                        # Next.js App Router routes
│   ├── (auth)/                 # Login, signup, forgot-password
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (platform)/             # Authenticated admin routes (protected by middleware)
│   │   ├── dashboard/          # Admin dashboard (owner, location_manager)
│   │   │   ├── page.tsx        # Overview / analytics
│   │   │   ├── menu/           # Menu editor
│   │   │   ├── tables/         # Table management + QR codes
│   │   │   ├── orders/         # Live orders view
│   │   │   ├── staff/          # Staff management
│   │   │   ├── analytics/      # Detailed analytics
│   │   │   └── settings/       # Restaurant settings
│   │   ├── kds/[locationId]/   # Kitchen Display System
│   │   │   └── page.tsx
│   │   ├── floor/[locationId]/ # Floor staff app
│   │   │   └── page.tsx
│   │   ├── superadmin/         # Super admin panel
│   │   │   ├── page.tsx        # Tenant list
│   │   │   └── [tenantId]/     # Tenant detail / impersonation
│   │   └── layout.tsx          # Sidebar nav, auth check
│   ├── (public)/               # Unauthenticated routes
│   │   └── [tenantSlug]/
│   │       └── table/
│   │           └── [publicCode]/
│   │               └── page.tsx  # Customer menu
│   ├── api/                    # API route handlers
│   │   ├── menu/               # Categories + items CRUD
│   │   ├── orders/             # Create, status transitions, cancel
│   │   ├── sessions/           # Create, close, timeout
│   │   ├── tables/             # Table CRUD + QR generation
│   │   ├── events/             # Table events (waiter call, bill request)
│   │   ├── staff/              # Staff account management
│   │   ├── analytics/          # Dashboard data queries
│   │   ├── tenants/            # Tenant management
│   │   └── webhooks/           # Resend delivery webhooks
│   ├── layout.tsx              # Root layout (html, body, fonts)
│   └── globals.css             # Tailwind directives, CSS variables
├── components/                 # Shared React components
│   ├── ui/                     # Generic primitives (Button, Card, Input, Badge, etc.)
│   ├── layout/                 # Shell, sidebar, nav, header
│   ├── menu/                   # Menu editor (category list, item cards, drag handles)
│   ├── orders/                 # Order cards, status badges, time counters
│   ├── customer/               # Customer-facing (cart, category tabs, item modal)
│   └── kds/                    # KDS-specific (order queue card, action buttons)
├── lib/                        # Shared utilities and clients
│   ├── supabase/
│   │   ├── client.ts           # Browser client (createBrowserClient from @supabase/ssr)
│   │   ├── server.ts           # Server client (createServerClient from @supabase/ssr)
│   │   └── admin.ts            # Service-role client (for admin operations, bypasses RLS)
│   ├── redis.ts                # Upstash Redis client
│   ├── utils.ts                # General helpers (formatPrice, cn, timeAgo, etc.)
│   └── validators.ts           # Zod schemas for API input validation
├── hooks/                      # Custom React hooks
│   ├── use-realtime.ts         # Supabase Realtime subscription wrapper
│   ├── use-cart.ts             # Customer cart state
│   └── use-media-query.ts      # Responsive breakpoint detection
├── types/                      # Shared TypeScript types
│   ├── database.ts             # Generated Supabase types (or manual schema types)
│   └── index.ts                # Shared enums, utility types
├── styles/                     # Global styles
│   └── globals.css             # Tailwind imports, CSS custom properties
├── public/                     # Static assets (favicon, default images)
├── supabase/
│   ├── migrations/             # SQL migration files (numbered)
│   └── seed.sql                # Dev seed data
└── .env.local.example          # Environment variable template
```

---

## System Boundaries

| Layer | Owns | Must Never |
|---|---|---|
| API routes (`app/api/`) | Business logic, input validation, auth checks, response formatting | Access the DOM; expose internal UUIDs or tenant_ids to the client; skip RLS checks |
| Supabase (DB + Auth + Realtime) | Data storage, RLS enforcement, auth sessions, real-time broadcasts, file storage | Run business logic (keep in API layer or database functions); expose service-role key to the client |
| Components (`components/`) | Rendering, local UI state, user interactions | Make direct DB calls; contain business logic; hardcode API URLs |
| Lib (`lib/`) | Shared utilities, DB client factories, validation schemas | Contain React components or JSX; access browser APIs (server-only modules) |
| Hooks (`hooks/`) | Client-side state, subscriptions, DOM interactions | Contain business logic; make unauthenticated API calls |
| Customer menu | Display menu, submit orders, call waiter, request bill | Access admin data, KDS data, or floor staff data; write to any table besides orders and table_events |
| KDS | View orders for assigned location, transition order status | Access other locations' orders; modify menu or tables; see financial data |
| Floor staff app | View feed, resolve events, view sessions, clear tables | Modify orders directly; access menu editor; see other locations' data |
| Super admin | View all tenants, override plans, impersonate | Modify tenant business data (menu, orders); bypass audit logging |

---

## Data Flow

### Order Placement
```
Customer taps "Place Order"
  → POST /api/orders (session_id, items[], notes)
  → API validates: session is active, all items are_available (server-side re-check)
  → API snapshots: item_name, item_price from items table at this moment
  → Insert into orders + order_items
  → Supabase Realtime broadcasts INSERT on orders table
  → KDS (subscribed to orders for this location) receives → new card appears + chime plays
  → Floor staff app receives (if subscribed) → order appears in session history
```

### Order Status Update (KDS)
```
Kitchen taps "Start" or "Mark Ready"
  → PATCH /api/orders/[id] { status: "in_progress" | "ready" }
  → API validates: current status allows this transition
  → Update orders.status
  → Supabase Realtime broadcasts UPDATE on orders table
  → Floor staff app receives → if status = "ready", new feed item appears + alert sound
```

### Table Event (Customer)
```
Customer taps "Call Waiter" or "Request Bill"
  → POST /api/events { session_id, table_id, type: "waiter_called" | "bill_requested" }
  → Insert into table_events
  → Supabase Realtime broadcasts INSERT on table_events
  → Floor staff app receives → new feed item + alert sound
  → BILL_REQUESTED card shows session running total (computed from order_items)
```

### Session Lifecycle
```
Customer scans QR
  → Lookup table by public_code → get location_id, table_id
  → Check for active session on this table
  → If no active session → create new session → prompt name
  → If active session and customer has no cookie → prompt name → "Are you with [name]?"
    → Yes → join existing session
    → No → insert check_needed table_event → let them into menu under existing session
  → Session auto-closes after configurable timeout (default 150 min)
```

---

## Auth Model

### Supabase Auth Integration
- Users sign up / log in via Supabase Auth (email + password)
- A `custom_access_token_hook` PL/pgSQL function reads the user's role from the `staff` table and injects it as a `user_role` claim into the JWT
- RLS policies on every tenant-scoped table use `auth.jwt() ->> 'user_role'` and `auth.uid()` to enforce access
- The `@supabase/ssr` package handles session cookies in Next.js (middleware + server components)

### Role Hierarchy
| Role | Access |
|---|---|
| `super_admin` | Super admin panel only. Sees all tenants. Cannot access tenant dashboards directly (uses impersonation). |
| `owner` | Full admin dashboard for their tenant. All locations (or single location). |
| `location_manager` | Admin dashboard scoped to one location. No billing, no brand settings. |
| `kitchen` | KDS only. Assigned to one location. |
| `floor` | Floor staff app only. Assigned to one location. |

### RLS Policy Pattern
Every tenant-scoped table has policies like:
```sql
-- Owner can see all rows for their tenant
CREATE POLICY "owner_select" ON orders
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM staff WHERE tenant_id = orders.tenant_id AND role = 'owner')
  );

-- Kitchen/floor can only see rows for their location
CREATE POLICY "staff_select" ON orders
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth_id FROM staff
      WHERE staff.location_id = orders.location_id
      AND staff.role IN ('kitchen', 'floor')
    )
  );
```

---

## Invariants

Rules the AI agent must never violate:

1. **Every tenant-scoped query MUST include `tenant_id` filter** — RLS is the backstop, not the primary defense. App-level filtering is always the first line.

2. **`location_id` on staff records for `kitchen`/`floor` roles is NEVER null** — reject at creation time, not just in the UI. A kitchen or floor account with no location has nowhere to log in.

3. **Customer menu NEVER exposes internal UUIDs, location_ids, or tenant_ids in URLs** — only `public_code` (8-char random string). Location and table are resolved server-side.

4. **Orders can only be cancelled from `PENDING` or `IN_PROGRESS`** — once `READY`, the order exists in the physical world. Never allow cancellation from `READY` or `DELIVERED`.

5. **Item prices on orders are SNAPSHOT copies** — `order_items.item_name` and `order_items.item_price` are copied at order time. Never reference `items.price` for historical order display.

6. **Session timeout is enforced server-side** — client-side timers are cosmetic only. The actual check happens when the session is next accessed or via a cron job.

7. **Starter tier customers NEVER see ordering UI** — no cart, no "Place Order" button, no call waiter, no request bill. Menu browse only.

8. **Staff roles are enforced at BOTH the API route level AND via RLS** — never rely on only one layer. Missing either creates a vulnerability.

9. **AI features are completely absent from the UI for non-eligible tiers** — not greyed out, not locked, not mentioned. Progressive disclosure means invisible, not disabled.

10. **Multi-location UI is completely hidden until a second location exists** — no "Locations" label, no location switcher, no location-related settings.

11. **The customer menu renders in the diner's browser locale language** — auto-detected, with French as fallback. Manual toggle always visible. RTL activates for Arabic.

12. **`public_code` on tables is 8 characters, random, unique** — not a UUID, not sequential, not predictable. Generated server-side.
