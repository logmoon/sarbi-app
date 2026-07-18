# UI Registry

_Written by `/imprint` after building any UI component. Read this before building a new one — never duplicate a pattern that already exists here._

---

## Components

### Card

File: `components/ui/card.tsx`
Last updated: 2026-07-08

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Background       | `bg-surface`      |
| Border           | `border border-border` |
| Border radius    | `rounded-md`      |
| Padding          | `p-4`             |
| Header spacing   | `mb-4`            |
| Footer layout    | `mt-4 flex items-center gap-2` |

**Pattern notes:**
Card is the base container for all content panels. No shadow by default. Content area has no padding override (inherits p-4). CardHeader/CardContent/CardFooter subcomponents are always used inside Card.

### Button

File: `components/ui/button.tsx`
Last updated: 2026-07-08

| Property         | Class / Value     |
| ---------------- | ----------------- |
| All variants     | `rounded-sm px-4 py-2 text-sm font-medium min-h-10 min-w-10` |
| Primary          | `bg-accent text-white hover:bg-accent-hover` |
| Secondary        | `bg-surface text-text-primary border border-border hover:bg-background` |
| Danger           | `bg-status-error text-white hover:opacity-90` |
| Ghost            | `bg-transparent text-text-secondary hover:bg-background` |
| Disabled         | `opacity-50 cursor-not-allowed` |

**Pattern notes:**
Four variants cover all action types. Primary is the default. All buttons use `inline-flex items-center justify-center` layout. Touch target minimum is 40×40px (`min-h-10 min-w-10`).

### Input

File: `components/ui/input.tsx`
Last updated: 2026-07-08

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Background       | `bg-surface`      |
| Border           | `border border-border` |
| Border (error)   | `border-status-error` |
| Border radius    | `rounded-sm`      |
| Focus ring       | `focus:ring-2 focus:ring-border-focus` |
| Text             | `text-sm text-text-primary` |
| Placeholder      | `placeholder:text-text-muted` |
| Label            | `text-sm font-medium text-text-secondary` |
| Error message    | `text-xs text-status-error` |
| Disabled         | `opacity-50 cursor-not-allowed` |
| Spacing          | `flex flex-col gap-1.5` (wrapper), `px-3 py-2` (input) |

**Pattern notes:**
Input wraps label + field + error in a single component. Label is optional — when omitted, no label renders. Error state switches border to status-error and shows text below. Focus ring matches brand accent color.

### Dialog

File: `components/ui/dialog.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Overlay          | `fixed inset-0 z-50 bg-black/50` |
| Panel            | `max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-5 shadow-lg` |
| Title            | `text-xl font-semibold text-text-primary` |
| Close button     | `rounded-sm p-1 text-text-muted hover:bg-background hover:text-text-primary` |
| Actions footer   | `mt-6 flex items-center justify-end gap-2` |

**Pattern notes:**
Dialog is portal-based with focus trap (Tab/Shift+Tab cycling). Escape closes. Clicking overlay closes. Previous focus restored on close. Title bar has close button on the right. DialogActions is a separate subcomponent for the action button row.

### Switch

File: `components/ui/switch.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Track (on)       | `bg-accent`       |
| Track (off)      | `bg-border`       |
| Thumb            | `h-4 w-4 rounded-full bg-white` |
| Focus ring       | `focus-visible:ring-2 focus-visible:ring-border-focus` |
| Label            | `text-sm text-text-primary` |
| Disabled         | `opacity-50 cursor-not-allowed` |

**Pattern notes:**
Uses `role="switch"` with `aria-checked`. Inline-flex with label on the right. Thumb slides `translate-x-4` when checked. Track is `h-5 w-9 rounded-full`.

### ConfirmDialog

File: `components/ui/confirm-dialog.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Base             | Uses `Dialog` component |
| Message          | `text-sm text-text-secondary` |
| Actions          | Cancel (secondary) + Confirm (danger variant) |

**Pattern notes:**
Specialization of Dialog for delete/destructive confirmations. Accepts `variant` prop (danger or primary) to toggle button style. Loading state shows `loadingLabel` on the confirm button (defaults to "Deleting..." — pass a specific one for non-delete destructive actions, e.g. "Clearing..." for Clear Table).

### TableCard

File: `components/tables/table-card.tsx`
Last updated: 2026-07-15

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Background       | `bg-surface` (via Card) |
| Border           | `border border-border` + `border-l-4` (status-dependent) |
| Border radius    | `rounded-md` (via Card) |
| Status border    | `border-l-status-success` (occupied), `border-l-border` (available), `border-l-text-muted` (inactive) |
| Status badge     | `rounded-full px-2 py-0.5 text-xs font-medium` |
| Badge active     | `bg-status-success/10 text-status-success` |
| Badge muted      | `bg-text-muted/10 text-text-muted` |
| Table label      | `text-base font-semibold text-text-primary` |
| QR container     | `h-28 w-28` with flex centering, SVG constrained via `[&>svg]:h-full [&>svg]:w-full` |
| Code toggle      | `text-xs text-text-muted hover:text-text-secondary` |
| Code text        | `font-mono text-xs text-text-muted` |
| Inactive dim     | `opacity-60` |
| Clear Table btn  | `Button variant="danger"`, `mb-2 w-full text-xs`, shown only when occupied |

**Pattern notes:**
TableCard has three visual states derived from `is_active` + `has_active_session`: occupied (green border + badge), available (default), inactive (muted border + 60% opacity). Uses the project's status-border convention (4px left border) from ui-rules.md. QR preview uses inline SVG (no canvas), with a subtle show/hide toggle for the public code. When occupied, a full-width danger "Clear Table" button appears above the download row, calling `onClearTable(table)` — the parent (`TablesManager`) owns the confirmation dialog, matching the existing edit/delete pattern. Needs `table.active_session_id` (from `GET /api/tables`) to know which session to close.

### Sidebar

File: `components/layout/sidebar.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `w-60 border-r border-border bg-surface` |
| Logo area        | `h-14 border-b border-border px-4` |
| Nav item (active) | `bg-accent text-white` |
| Nav item (inactive) | `text-text-secondary hover:bg-background hover:text-text-primary` |
| Nav item         | `rounded-sm px-3 py-2 text-sm font-medium` |
| "Soon" badge     | `text-xs text-text-muted` |
| Hamburger        | `fixed left-4 top-3 z-40 lg:hidden` |
| Mobile overlay   | `fixed inset-0 z-30 bg-black/30 lg:hidden` |

**Pattern notes:**
Fixed 240px (`w-60`) on desktop, slides in from left on mobile with backdrop. Active nav item uses accent bg with white text. Inactive items use secondary text color. Routes not yet built show "Soon" badge. Mobile hamburger toggles visibility.

### MenuItemCard

File: `components/customer/menu-item-card.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Background       | `bg-surface` (via Card) |
| Border           | `border border-border` (via Card) |
| Border radius    | `rounded-md` (via Card) |
| Layout           | `flex gap-3 cursor-pointer` (horizontal: thumbnail | content) |
| Image container  | `h-20 w-20 flex-shrink-0 overflow-hidden rounded-md` |
| Item name        | `text-sm font-semibold text-text-primary` |
| Item description | `text-xs text-text-secondary line-clamp-2` |
| Price            | `text-sm font-semibold text-accent` |
| Add button       | `h-8 w-8 rounded-full bg-accent text-white hover:bg-accent-hover` |
| Unavailable dim  | `opacity-60` |
| Hover state      | `hover:shadow-md` (via Card onClick) |

**Pattern notes:**
MenuItemCard is the customer-facing menu item. Horizontal layout with optional 80×80 image thumbnail on the left. Price and + button are in a `justify-between` row at the bottom of the text column. The + button is always a circular 32×32 accent button. Unavailable items are dimmed 60%.

### CategoryTabs

File: `components/customer/category-tabs.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `sticky top-0 z-20 border-b border-border bg-background` |
| Tab wrapper      | `flex gap-2 overflow-x-auto px-4 py-3` |
| Tab active       | `bg-accent text-white` |
| Tab inactive     | `bg-surface text-text-secondary hover:text-text-primary border border-border` |
| Tab              | `whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors` |

**Pattern notes:**
Horizontal scrollable pill tabs. Active tab uses accent bg with white text. Inactive tabs are white with border. No shadow. Sticky below the page header so categories remain accessible while scrolling.

### LanguageToggle

File: `components/customer/language-toggle.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5` |
| Active locale    | `bg-accent text-white rounded-md px-2.5 py-1 text-xs font-medium` |
| Inactive locale  | `text-text-secondary hover:text-text-primary rounded-md px-2.5 py-1 text-xs font-medium` |

**Pattern notes:**
Compact 3-language toggle (AR/FR/EN) in the page header. Inline-flex with segmented-control styling. Active locale uses accent fill.

### ActionButtons (waiter call + bill request)

File: `components/customer/action-buttons.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `fixed bottom-4 right-4 z-20 flex flex-col items-end gap-2` |
| Button shape     | `h-12 w-12 rounded-full p-0 shadow-md` |
| Call Waiter      | `variant="ghost"` (icon only) |
| Request Bill     | `variant="secondary"` (icon only) |
| Error toast      | `bg-status-error/10 px-3 py-2 text-xs text-status-error rounded-md shadow-md` |

**Pattern notes:**
Two floating circle buttons in the bottom-right corner. Waiter call uses ghost variant (transparent bg), bill request uses secondary variant (white bg with border). Both are 48×48 for touch target. An error toast appears above the buttons on failure. The entire block is hidden when there is no active session.

### FullScreenMessage

File: `components/customer/full-screen-message.tsx`
Last updated: 2026-07-15

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `flex min-h-screen items-center justify-center bg-background px-4` |
| Title            | `text-xl font-semibold text-text-primary` |
| Description      | `mt-2 text-sm text-text-secondary` |
| Action button    | `mt-6`, default Button variant |

**Pattern notes:**
Full-page takeover for customer states where the menu itself can't be shown: inactive table (SSR, `app/(public)/[tenantSlug]/table/[publicCode]/page.tsx`) and blocked session after declining "Are you with [name]?" (client, `customer-shell.tsx`). No `"use client"` directive — safe to render from a server component directly. Takes an optional `action: { label, onClick }` for a retry affordance; omit for a terminal state with no next step. Reuse this instead of writing another one-off centered-message block — it was extracted specifically because that pattern already existed twice.

### Cart Drawer

File: `components/customer/cart-drawer.tsx`
Last updated: 2026-07-09

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Floating button  | `fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-6 py-3 text-white shadow-lg` |
| Drawer           | `fixed inset-x-0 bottom-0 flex flex-col rounded-t-xl bg-surface shadow-lg` |
| Drawer max height| `max-h-[80vh]` |
| Drawer header    | `flex items-center justify-between border-b border-border px-4 py-3` |
| Item name        | `text-sm font-medium text-text-primary` |
| Item price       | `text-xs text-text-muted` |
| Item notes       | `text-xs italic text-text-secondary` |
| Quantity ctrl    | `h-6 w-6 rounded-full border border-border text-text-secondary` |
| Remove button    | `p-1 text-text-muted hover:text-status-error` |
| Clear button     | `text-xs text-status-error hover:underline` |
| Total            | `text-sm font-semibold text-text-primary` |
| Place Order btn  | Primary Button variant |
| Overlay          | `fixed inset-0 z-30 bg-black/30` |

**Pattern notes:**
Bottom sheet drawer for cart review. Triggered by a floating accent pill showing count + total. Drawer slides up from bottom with overlay backdrop. Quantity controls are 24×24 circular buttons with min/max/remove. Place Order is in the sticky bottom footer area with an optional notes input.

### KdsBoard (+ OrderQueueCard, CancelOrderModal)

Files: `components/kds/kds-board.tsx`, `components/kds/order-queue-card.tsx`, `components/kds/cancel-order-modal.tsx`
Last updated: 2026-07-18

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Page background  | `bg-kds-background text-kds-text` (fixed dark theme — see "KDS (fixed dark theme)" in ui-tokens.md) |
| Card             | `rounded-md border-2 bg-kds-surface p-4` |
| Card border      | `border-status-error` (pending) / `border-status-warning` (in_progress) / `border-status-success` (ready) |
| Status label     | `text-xs font-semibold tracking-wide` in matching status color — paired with the border, never color alone |
| Table label      | `text-[32px] font-bold leading-none` (deliberately outside the default type scale — see ui-tokens.md) |
| Item name        | `text-xl` (20px, exact match to Tailwind's default scale) |
| Secondary text   | `text-kds-text-secondary` |
| Timer            | `font-mono text-lg font-semibold tabular-nums`, color escalates `text-kds-text-secondary` → `text-status-warning` (≥10min) → `text-status-error` (≥15min) |
| Grid             | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (same responsive pattern as TableCard's grid) |
| Mute toggle      | `h-10 w-10 rounded-full border border-kds-border-subtle` icon button, top-right of header |
| Cancel modal     | Reuses `Dialog` (light theme, unchanged) — radiogroup of reason codes + conditional text field for "other" |

**Pattern notes:**
KDS is the one screen in the app with a fixed dark theme, independent of everything else — don't reuse `bg-kds-*` tokens anywhere outside `components/kds/`. `OrderQueueCard` fades out via CSS transition keyed to `READY_FADE_MS` (exported from `hooks/use-kds-orders.ts`) so the animation duration and the actual list-removal timing can never drift apart — if that constant changes, the fade updates automatically. The cancel modal intentionally stays light-themed (an overlay dialog doesn't need to match the page behind it, and reusing `Dialog` as-is avoids a one-off dark variant). Sound (`hooks/use-kds-sound.ts`) unlocks on first pointer/keydown anywhere on the page rather than gating the queue behind a splash screen — don't add one.

### Auth Screens (layout + login + setup)

Files: `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/setup/page.tsx`
Last updated: 2026-07-18

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Page background  | `bg-background` + `QrMotifBackground` (inline SVG, `fillOpacity="0.05"`, `text-accent`) |
| Wordmark         | `text-3xl font-bold tracking-tight text-accent` + tagline `text-sm text-text-secondary` below it |
| Card             | Standard `Card`, overridden to `p-6 sm:p-8` (more breathing room than the default `p-4`) |
| Heading          | `text-2xl font-bold text-text-primary` + one-line `text-sm text-text-secondary` subline |
| Error message     | `flex items-start gap-2 rounded-md bg-status-error/10 px-3 py-2 text-sm text-status-error` with an inline alert-circle icon — same box convention as `ActionButtons`' error toast, never color-only |
| Button spinner   | `h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent` inline with the loading label (same spinner technique as `customer-shell.tsx`, just white for use on the filled accent button) |
| Entrance motion  | `motion-safe:animate-fade-in` on the whole card block (keyframe registered in `tailwind.config.ts`) — one entrance only, nothing else animates |

**Pattern notes:**
`QrMotifBackground` is a deliberate, on-brand signature element (Sarbi is a QR-ordering product) — a sparse, irregular grid of rounded squares at 5% opacity, not a literal QR code. Reuse it if another auth-adjacent screen needs the same treatment; don't invent a second background motif. The wordmark is the same `text-accent font-bold` treatment already used in the dashboard sidebar, just larger here since it's the hero context. Copy is grounded and specific ("Sign in to manage your restaurant," "Welcome, {name}") rather than generic boilerplate — no invented links or contact info were added since none exist yet (no forgot-password flow, no support address).
