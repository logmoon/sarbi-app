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
Last updated: 2026-07-22

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Overlay          | `fixed inset-0 z-50 bg-black/50` |
| Panel            | `max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-5 shadow-lg` |
| Title            | `font-heading text-xl font-semibold text-text-primary` |
| Close button     | `rounded-sm p-1 text-text-muted hover:bg-background hover:text-text-primary` |
| Actions footer   | `mt-6 flex items-center justify-end gap-2` |

**Pattern notes:**
Dialog renders in place in the React tree — it is **not** portal-based (no `createPortal`), just a `fixed`-positioned overlay/panel. This matters for theming: it's why CSS custom-property overrides set on the customer shell's root (`lib/brand.ts#themeStyleVars`) correctly cascade into every dialog/modal used on the customer menu (item detail, confirm dialogs) with no extra wiring — a portal to `document.body` would have escaped that scope entirely. Do not introduce a portal here without re-threading the theme vars onto the portal target.
Has focus trap (Tab/Shift+Tab cycling). Escape closes. Clicking overlay closes. Previous focus restored on close. Title bar has close button on the right. DialogActions is a separate subcomponent for the action button row.
`onClose` is read through an internal ref (`onCloseRef`), not included in the mount/focus effect's dependency array. Callers routinely pass an inline arrow (`onClose={() => setOpen(false)}`), which gets a new identity on every parent re-render — if that identity were a dependency, any parent re-render (e.g. a form's `onChange` firing on every keystroke) would re-run the "focus the first input" effect and yank focus away from whatever the user was actually typing in. This was a real, previously-shipped bug (staff invite form) fixed by moving to the ref pattern; don't reintroduce `onClose`/`trapFocus` into that effect's deps.
Title always uses `font-heading`, not `font-sans` — safe everywhere (admin dialogs included) because `--font-heading` defaults to the same value as `--font-inter` unless a tenant-themed ancestor overrides it (see `ui-tokens.md` → "Menu Theme").

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
Uses `role="switch"` with `aria-checked`. Inline-flex with label on the right. Thumb slides `translate-x-4 rtl:-translate-x-4` when checked (RTL-aware). Thumb position uses `ms-0.5` (logical margin-inline-start) for correct RTL anchoring. Track is `h-5 w-9 rounded-full`.

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
Last updated: 2026-07-19

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `fixed inset-y-0 start-0 z-30 flex w-60 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 rtl:lg:translate-x-0` |
| Closed (mobile)  | `-translate-x-full rtl:translate-x-full` |
| Logo area        | `h-14 border-b border-border px-4` |
| Nav item (active) | `bg-accent text-white` |
| Nav item (inactive) | `text-text-secondary hover:bg-background hover:text-text-primary` |
| Nav item         | `rounded-sm px-3 py-2 text-sm font-medium` |
| Section label    | `mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted` |
| Section divider  | `my-3 border-t border-border` |
| Staff screens    | Secondary section below management items with divider + label, links to `/kds/[locationId]` and `/floor/[locationId]` |
| "Soon" badge     | `ms-auto text-xs text-text-muted` (logical margin for RTL) |
| Hamburger        | `fixed start-4 top-3 z-40 lg:hidden` (logical positioning) |
| Mobile overlay   | `fixed inset-0 z-30 bg-black/30 lg:hidden` |
| Sticky           | Parent layout uses `h-screen overflow-hidden` — sidebar is fixed-height, main scrolls independently |

**Pattern notes:**
Fixed 240px (`w-60`) on desktop, slides in from left on mobile with backdrop. Active nav item uses accent bg with white text. Inactive items use secondary text color. Staff screens section appears only when `staffLocationId` prop is provided (fetched server-side in dashboard layout). Routes not yet built show "Soon" badge. All positioning uses logical properties (`start-0`, `start-4`, `ms-auto`) for RTL compatibility. Mobile close animation reverses correctly in RTL via `rtl:translate-x-full`.

### MenuItemCard

File: `components/customer/menu-item-card.tsx`
Last updated: 2026-07-22

`MenuItemCard` is a **dispatcher**, not a single design — it renders one of three internal variants based on the tenant's `layout` theme preset (`lib/brand.ts`'s `LayoutPreset`, defaulting to `"grid"`). The previous entry here described a single horizontal-thumbnail layout that no longer exists in the codebase (stale, predates this update) — all three current variants below replace it.

| Variant | Layout | Image | Used when |
| --- | --- | --- | --- |
| `GridCard` (default) | 2-up grid, `flex flex-col`, `min-h-[230px]` | `h-28` full-width, top | `layout: "grid"` |
| `CompactCard` | Single dense row, `flex items-center gap-3`, bordered, `last:border-b-0` | `h-12 w-12` thumbnail, leading | `layout: "compact"` |
| `MagazineCard` | Single column, larger card, `flex flex-col` | `aspect-[16/10]` full-width, top | `layout: "magazine"` |

Shared across all three:

| Property | Class / Value |
| --- | --- |
| Card chrome | `bg-surface` / `border-border` / `rounded-md` (via `Card`, except `CompactCard` which is a plain bordered `<div>` row, not a `Card`) |
| Item name | `font-heading text-sm font-semibold text-text-primary` (`text-base` in `MagazineCard`) — the only place the tenant's font preset shows up on this component |
| Description | `text-xs`/`text-sm text-text-secondary`, `line-clamp-2`/`line-clamp-3` — **not** `font-heading` — body text always stays on the neutral font |
| Price | `text-sm font-semibold text-accent` (`text-base` in `MagazineCard`) |
| Add button | Circular accent button (`AddButton` subcomponent, `h-8 w-8` / `h-7 w-7` in `size="sm"` for `CompactCard`); `MagazineCard` uses a labeled pill button (`t(locale, "customer.addToOrder")`) instead, since it has room |
| Unavailable dim | `opacity-60` |

**Pattern notes:**
The `layout` prop comes from `customer-shell.tsx`'s parsed theme (`parseMenuTheme(theme).layout`) and is threaded straight through — this component has no theme-reading logic of its own, it's a pure prop-driven view. The wrapping grid/list container className also switches on the same `layout` value in the consumer (`customer-shell.tsx` and `MenuThemePreview` both do this independently — see "Menu Theme System" below for the exact className-per-layout mapping, kept in sync in both places). Adding a fourth layout preset means: a new `LayoutPreset` union member (`lib/brand.ts`), a new variant function + dispatcher branch here, a new wrapper className branch in both consumers, and a new `settings.layout*` i18n key + `LAYOUT_OPTIONS` entry in `settings-form.tsx`.

### CategoryTabs

File: `components/customer/category-tabs.tsx`
Last updated: 2026-07-22

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `sticky top-0 z-20 border-b border-border bg-background` |
| Tab wrapper      | `flex gap-2 overflow-x-auto px-4 py-3` |
| Tab active       | `bg-accent text-white` |
| Tab inactive     | `bg-surface text-text-secondary hover:text-text-primary border border-border` |
| Tab              | `font-heading whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors` |

**Pattern notes:**
Horizontal scrollable pill tabs. Active tab uses accent bg with white text. Inactive tabs are white with border. No shadow. Sticky below the page header so categories remain accessible while scrolling. Tab label uses `font-heading` (added alongside the tenant menu-theme font presets) — same rationale as `MenuItemCard`'s item name: it's a title-level label, not body text.

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

### Account Deactivated Page

File: `app/account-deactivated/page.tsx`
Last updated: 2026-07-21

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6` |
| Card             | `Card` (`w-full max-w-[400px] p-6 text-center sm:p-8`) |
| Icon badge       | `mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-error/10`, error-colored circle-slash SVG |
| Title            | `text-xl font-bold text-text-primary` |
| Description      | `mt-2 text-sm text-text-secondary` |
| Action button    | `mt-6 w-full`, disabled until sign-out completes |

**Pattern notes:**
Same "full-page takeover" family as `FullScreenMessage`, but **not** built on it and **must** be `"use client"` — it needs to call `supabase.auth.signOut()` (browser client) on mount before offering a way out. Deliberately lives outside both the `(auth)` and `(platform)` route groups: `(auth)/layout.tsx` redirects any request with a live session straight to `/dashboard`, and `(platform)/layout.tsx` is what sent the user here in the first place (no resolvable *active* staff record — see `getStaffRecord`'s doc comment in `lib/api-helpers.ts`). Landing back inside either group before the session is actually terminated would loop. The "Back to login" button stays disabled until the `signOut()` promise resolves, specifically to avoid a race where clicking through with a still-valid session bounces straight back via `(auth)/layout.tsx`'s check.
This is a UX fix, not a data-access fix — RLS (via the JWT's `user_role` claim, nulled for inactive staff by the `custom_access_token_hook`) already prevented a deactivated account from reading/writing real tenant data. This page exists because, before it, a deactivated login either fell through to a blank-but-technically-still-there dashboard shell, or (briefly, mid-fix) a dashboard with a working nav bar and every API call failing with "Forbidden" — both confusing. Don't re-derive "is this user blocked" from anything other than `getStaffRecord` returning `null`; that function is already the single point where `is_active` is enforced.

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

### FileUpload

File: `components/ui/file-upload.tsx`
Last updated: 2026-07-19

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Drop zone        | `flex cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed px-4 py-5 text-center transition-colors` |
| Drop zone (idle) | `border-border hover:border-accent hover:bg-background` |
| Drop zone (drag) | `border-accent bg-accent-light` |
| Drop zone (disabled) | `pointer-events-none opacity-50` |
| Upload icon      | 24×24 SVG, `text-text-muted`, `strokeWidth="2"` |
| Drop zone title  | `text-sm text-text-secondary` |
| Drop zone subtitle | `text-xs text-text-muted` |
| Label            | `mb-1.5 text-sm font-medium text-text-secondary` (matches Input label pattern) |
| File row         | `flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2` |
| Filename         | `min-w-0 flex-1 truncate text-sm text-text-primary` |
| File size        | `shrink-0 text-xs text-text-muted` |
| Remove button    | `shrink-0 rounded-sm p-1 text-text-muted hover:text-text-primary` |
| Upload button    | `shrink-0 rounded-sm px-3 py-1 text-sm font-medium text-white bg-accent hover:bg-accent-hover` |
| Upload button (loading) | `bg-accent opacity-50` |
| Error            | `mt-1 text-xs text-status-error` (matches Input error pattern) |
| Image preview    | `mb-2 overflow-hidden rounded-sm` container, `h-32 w-full object-cover` img |
| Remove link      | `mt-2 rounded-sm border border-border px-3 py-1.5 text-sm text-status-error hover:bg-background disabled:opacity-50` |

**Pattern notes:**
Self-contained file upload with drag-and-drop support. States: empty drop zone, existing image preview (shows above zone), file selected row (name + size + cancel + upload), uploading (button dimmed), error (red text below). Labels and messages use i18n via `t()` — must receive `locale` prop. The drop zone icon is an upload arrow (Feather-style, 24×24, 2px stroke). Remove link uses `status-error` text on `border-border` background — consistent with the `muted + hover:status-error` convention from CartDrawer's remove button. When `currentUrl` is set and is an image, shows a preview above the drop zone. When `currentUrl` is set, the drop zone text changes to "Replace Image" — use `common.replaceImage` key. Hidden native `<input type="file">` is triggered by clicking the drop zone.

### FloorBoard

File: `components/floor/floor-board.tsx`
Last updated: 2026-07-19

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `flex h-screen flex-col bg-background` |
| Header           | `shrink-0 border-b border-border px-4 py-3` |
| Header title     | `text-lg font-bold text-text-primary` |
| Header subtitle  | `text-xs text-text-secondary` |
| Mute toggle      | `h-10 w-10 rounded-full border border-border text-text-secondary hover:bg-surface` (matches KDS pattern) |
| Tab bar          | `shrink-0 border-b border-border bg-background` |
| Tab container    | `flex gap-1 px-4 py-2` |
| Tab active       | `bg-accent text-white` |
| Tab inactive     | `text-text-secondary hover:bg-surface hover:text-text-primary` |
| Tab              | `rounded-sm px-3 py-1.5 text-sm font-medium transition-colors` |
| Error banner     | `mx-4 mt-3 shrink-0 rounded-sm border border-status-error bg-status-error/10 px-3 py-2 text-sm text-status-error` |
| Content area     | `flex-1 overflow-y-auto px-4 py-3` |

**Pattern notes:**
Full-screen layout (h-screen) — the floor app is a dedicated staff screen, not a dashboard page with sidebar. Tab switcher uses the same pill-style active state as sidebar nav items (accent bg + white text). Mute toggle matches KDS mute button styling exactly. Mobile-optimized via padding and touch targets. Error banner matches the existing error display convention from tables-manager.

### FeedCard

File: `components/floor/feed-card.tsx`
Last updated: 2026-07-19

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Base             | Uses `Card` component with status-border override |
| Status border    | `border-l-4` (follows TableCard convention: status-success, status-warning, status-error, status-info, border) |
| Card gap         | `flex-col gap-2` |
| Header row       | `flex items-start justify-between gap-2` |
| Event label      | `text-sm font-semibold text-text-primary` (waiter/bill/check) |
| Status label     | `text-sm font-semibold` in status-to-matching-text-color |
| Table info       | `text-sm text-text-secondary` (with customer name after em-dash) |
| Timestamp        | `text-xs text-text-muted` (right-aligned) |
| Running total    | `text-sm font-semibold text-accent` |
| Items list       | `text-sm text-text-secondary` (comma-separated "Qtyx Name") |
| Cancel reason    | `text-sm text-text-secondary` (translated via `translateCancelReason()`) |
| Action row       | `mt-1 flex gap-2` |
| Action button    | `flex-1 text-xs` (primary for Resolve/ConfirmDelivered, secondary for Acknowledge, danger for Clear Table) |

**Pattern notes:**
FeedCard handles 5 card types via a discriminated union (`FeedItem`). Status-left-border convention (4px, color-coded) matches TableCard pattern. Event-based cards (waiter/bill/check) show Resolve button; order-based cards show ConfirmDelivered (ready) or Acknowledge (cancelled). `session_conflict` events show a Clear Table button (danger variant) instead of Acknowledge when they carry a valid `session_id` — clicking it clears the session and resolves the event in one action via a ConfirmDialog. Cancellation reason codes (`out_of_stock`, `kitchen_error`, `other`) are translated using existing `kds.cancelReason.*` i18n keys. Prices use `formatItemPrice()` from lib/utils, matching the customer cart convention.

### LiveFeed

File: `components/floor/live-feed.tsx`
Last updated: 2026-07-19

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Card list gap    | `flex flex-col gap-3` |
| Loading state    | `flex items-center justify-center py-16` with `text-text-muted` |
| Empty state icon | 40×40 SVG checkmark, `text-text-muted`, `strokeWidth="1.5"`, `mb-2` |
| Empty state title| `text-lg font-medium text-text-primary` |
| Empty state desc | `text-sm text-text-secondary` (below title, centered) |

**Pattern notes:**
Empty state follows the established KDS all-caught-up pattern (40×40 Feather-style icon, centered, text below). Feeds are built by merging event-based items (from `table_events`) and order-based items (from `orders` with ready/cancelled status), sorted oldest-first by `created_at`.

### SessionTab

File: `components/floor/session-tab.tsx`
Last updated: 2026-07-19

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Base             | Uses `Card` component |
| Session card gap | `flex flex-col gap-3` |
| Expand toggle    | Full-width button, `flex items-center justify-between text-left` |
| Session title    | `text-sm font-semibold text-text-primary` |
| Session meta     | `text-xs text-text-secondary` |
| Session total    | `text-sm font-semibold text-accent` |
| Chevron          | 16×16 SVG, `text-text-muted`, `transition-transform`, `rotate-180` when expanded |
| Expanded area    | `border-t border-border pt-3` |
| Order card       | `rounded-sm border border-border bg-background p-2` (inside expanded session) |
| Status badge     | `rounded-full px-2 py-0.5 text-xs font-medium` — pending=error/10, in_progress=warning/10, ready=success/10, delivered/cancelled=muted/10 |
| Order total      | `text-xs font-semibold text-text-primary` |
| Order items      | `text-xs text-text-secondary` |
| Clear Table btn  | `variant="danger"`, `w-full text-xs`, inside a `border-t border-border pt-3` divider |
| Empty sessions   | Same empty-state pattern as LiveFeed/KDS (40×40 icon + title + desc) |

**Pattern notes:**
Expandable accordion pattern for session history. Status badges use the same color scheme as order status badges elsewhere (pending=error, in_progress=warning, ready=success, others=muted). Clear Table uses ConfirmDialog (danger variant) matching the existing TablesManager pattern. Prices use `formatItemPrice()`.

### SettingsForm

File: `components/settings/settings-form.tsx`
Last updated: 2026-07-22

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `mx-auto max-w-5xl space-y-6` (centered, capped width — widened from `max-w-3xl` so the Menu Theme card's two-column controls/preview layout has room) |
| Page title       | `text-2xl font-bold text-text-primary` + `text-sm text-text-secondary` subtitle |
| Section card     | Uses `Card` component (unchanged) |
| Section heading  | `text-lg font-semibold text-text-primary` |
| Section gap      | `space-y-5` (form fields), `space-y-6` inside Menu Theme (more breathing room between control groups) |
| Field label      | Reuses `Label` component (text-text-secondary, text-sm font-medium) |
| Field helper     | `mt-1 text-xs text-text-muted` (under the input) |
| Save button row  | `flex items-center justify-end` (single primary button, one per section) |
| Save status      | `text-xs text-status-success` (saved) or `text-xs text-status-error` (failed) |
| Menu Theme layout| `grid gap-8 lg:grid-cols-2` — controls column on the start side, `MenuThemePreview` on the end side, stacks to one column below `lg` |
| Preset button    | Shared look across surface/font/layout pickers: `rounded-sm border px-3 py-2.5 text-sm`, selected = `border-accent bg-accent-light text-accent-dark`, unselected = `border-border bg-surface text-text-primary hover:bg-background` |
| Surface picker   | `grid grid-cols-3 gap-2` (6 options — a `flex` row was tried first and got cramped once the tone count grew past 3) — each button also shows a `h-6 w-6 rounded-full` color swatch above the label |
| Font picker      | `grid grid-cols-2 gap-2` (4 options) — each button's own label is rendered `style={{ fontFamily: <that preset's CSS var> }}`, so the picker demonstrates itself |
| Layout picker    | `flex gap-2` (3 options, plain text buttons — the adjacent live preview already shows the visual difference, so these don't need their own illustration) |
| Upload fields    | `grid gap-4 sm:grid-cols-2` — Logo and Cover image, both `FileUpload` |

**Pattern notes:**
Three independent sections now, not two — Restaurant (name), **Menu Theme** (brand color, surface tone, font, layout, logo, cover image + live preview), and Location — each its own `Card` with its own save button. Per-section success message auto-clears after 2s. The `canEdit` flag gates the entire form (read-only for non-owners).
The Menu Theme save button PATCHes `brand_colors: {primary, surface, font, layout}` plus `logo_url`/`cover_url` together in one request — all four theme fields always travel as a unit even though they're picked via separate controls, since they're all facets of the same `MenuTheme` shape (`lib/brand.ts`) and there's no reason to let them drift out of sync via partial saves.
**Uploads are two-step, matching the existing menu-item-image pattern** (`components/menu/menu-editor.tsx`'s `handleUploadImage`): `FileUpload`'s own internal "confirm" button uploads straight to Supabase Storage (`menu-images` bucket, `logos/`/`covers/` prefix — same bucket as item images, no new storage policy needed) and returns the public URL immediately; that URL only reaches the database when the surrounding form's own Save button is clicked. Don't assume an uploaded image is persisted the moment `FileUpload` returns — it's just been staged in the local `logoUrl`/`coverUrl` state at that point.
See "Menu Theme System" below for the cross-cutting design (why presets, not raw pickers).

### MenuThemePreview

File: `components/settings/menu-theme-preview.tsx`
Last updated: 2026-07-22

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | `overflow-hidden rounded-sm border border-border bg-background`, theme vars applied via inline `style` |
| Cover slot       | `h-28 w-full overflow-hidden` (only rendered if a cover image is set) |
| Header slot      | `flex items-center gap-2 border-b border-border bg-surface px-3 py-2.5` — logo + `font-heading` tenant name |
| Category tabs    | Renders the real `CategoryTabs` component, not a mockup |
| Items            | Renders the real `MenuItemCard` (whichever layout variant is selected), not a mockup |

**Pattern notes:**
This is a **live, realistic** preview, not an illustration — it composes the actual `CategoryTabs` and `MenuItemCard` components used on the real customer menu, fed 2 sample categories / 3 sample items with placeholder text (multi-locale, so it also respects the admin's current UI language) and an inline-SVG "food photo" placeholder (a plain fork/knife glyph — deliberately not a hotlinked stock photo, since this ships in the admin bundle). Because it reuses the real components, any future change to `MenuItemCard`/`CategoryTabs` automatically shows up correctly here with zero extra work — **do not build a second, simplified mock version of the menu UI for a future preview need; extend this component instead.** Takes the in-progress (unsaved) form state directly as props, so every keystroke/selection updates it immediately, before Save is ever clicked.

### Menu Theme System

Cross-cutting — not a single component. Files: `lib/brand.ts` (types + derivation), `lib/fonts.ts` (font loading), `app/(public)/layout.tsx` (font scoping), `components/customer/customer-shell.tsx` (cover banner + root style injection), `components/settings/settings-form.tsx` + `menu-theme-preview.tsx` (editing UI).
Last updated: 2026-07-22

**How a theme flows through the app:**
1. Stored as one JSONB value: `tenants.brand_colors = { primary, surface, font, layout }` (plus the separate top-level columns `logo_url`/`cover_url`).
2. `lib/brand.ts#parseMenuTheme(raw)` coerces it defensively — unrecognized/missing `surface`/`font`/`layout` each fall back to their own default independently (`"light"`/`"modern"`/`"grid"`) rather than invalidating the whole theme. Only a missing/invalid `primary` hex makes the whole theme `null`. This means an old tenant record saved before a new preset existed, or a preset that gets removed later, degrades safely instead of breaking rendering.
3. `lib/brand.ts#themeStyleVars(theme)` turns that into a `CSSProperties` object: `--color-accent*` (derived from `primary` via simple RGB mixing — see the function for the darken/lighten math), the surface tone's background/surface/border overrides (see `ui-tokens.md`), and `--font-heading`.
4. `customer-shell.tsx` applies that object as inline `style` on the customer menu's single root `<div>`. Every themed value cascades from there via ordinary CSS inheritance/custom-property scoping — **there is no portal anywhere in the customer menu's component tree** (verified when fixing the quantity-color bug below), which is what makes this "set it once at the root" approach work at all.
5. `layout` (grid/compact/magazine) isn't a CSS var — it's a plain prop threaded from the parsed theme into `MenuItemCard`, which dispatches to the matching variant (see its own entry above).

**Gotcha already hit once — CSS variable overrides do not retroactively affect an ancestor's already-inherited `color`.** `body`'s `color: var(--color-text-primary)` resolves once, at the `body` element, using whatever value is in scope *there* — a descendant div overriding the same custom property later does not change `body`'s own resolved value, and anything that inherits `color` without itself referencing the token again just inherits that stale root-level resolution. Concretely: two quantity `<span>`s (cart drawer, item detail modal) had no explicit color class at all and were silently stuck on light-theme black under the `dark` surface tone, because everything between them and `body` also had no explicit color class. Fixed by giving both spans `text-text-primary` directly. **Any new customer-facing text element must carry an explicit `text-*` (or `font-heading`) class — never rely on inheriting color/font through an ancestor chain that doesn't itself reference the token**, or it will silently ignore surface-tone/font theming.
See `ui-tokens.md` → "Menu Theme" for the concrete preset values, and `ui-rules.md` → "Tenant Menu Theming" for why this stays a closed set of presets rather than free-form input.

### ColorField

File: `components/settings/settings-form.tsx` (inline subcomponent)
Last updated: 2026-07-22

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | (just the field row) |
| Color swatch     | `<input type="color">` with `h-10 w-12 rounded-sm border border-border bg-surface p-0.5 cursor-pointer disabled:opacity-50` |
| Hex text input   | `flex-1 rounded-sm border bg-surface px-3 py-2 text-sm text-text-primary font-mono focus:ring-2 focus:ring-border-focus` |
| Hex border (ok)  | `border-border` |
| Hex border (bad) | `border-status-error` |
| Hex change       | `onChange` uppercases the value from the color picker; hex text input allows free-typed input |

**Pattern notes:**
Two-input pattern: native color picker on the left (visual, swatches the value), hex text input on the right (precise, allows copy-paste of exact codes). Both stay in sync. Hex validation lives in the parent (`isValidHex` regex `^#[0-9A-Fa-f]{6}$`) — the Save button is disabled and the text input gets a red border when invalid.
Now lives inside the Menu Theme card (still the only free-color-value input in that card — surface/font/layout are all closed-set preset pickers, not more instances of this pattern). This is still the general-purpose color-picker pattern for the one place a tenant genuinely picks an arbitrary color; don't extend the same free-input approach to surface tone, font, or anything else — see "Menu Theme System" above.

### StaffManager

File: `components/staff/staff-manager.tsx`
Last updated: 2026-07-20

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | (page-level, no wrapper) |
| Page header      | `mb-6 flex items-center justify-between` with title + subtitle on the left, primary action button on the right — same pattern as TablesManager |
| Member card      | Uses `Card` component (no status border — different from Floor's FeedCard) |
| Card content     | `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` |
| Member name row  | `flex flex-wrap items-center gap-2` (name + status badge) |
| Status badge     | `rounded-full px-2 py-0.5 text-xs font-medium` — active=success/10, pending=warning/10, inactive=muted/10 |
| Role/location    | `mt-1 text-xs text-text-muted` with ` · ` separator |
| Action buttons   | `flex flex-wrap gap-2`, all `variant="secondary"` `text-xs` |
| Empty state      | Same icon-free pattern as TablesManager (title + desc + primary CTA) |
| Error banner     | `mb-4 rounded-sm border border-status-error bg-status-error/10 p-3 text-sm text-status-error` with dismiss button — same convention as TablesManager |
| Invite dialog    | Reuses `Dialog` + `DialogActions` from ui library |
| Form inputs      | `Input` (email, name) + hand-rolled native `<select>` matching `Input` styling (border, ring, padding) |
| Success result   | `rounded-sm border px-3 py-2 text-sm` with success/10 (green) or warning/10 (amber) variants based on email_sent flag |
| Copy link input  | Native readonly `<input>` with monospace font, sits next to a `variant="secondary"` copy button |
| ConfirmDialog    | Reused for "Remove Invite" (danger variant) |

**Pattern notes:**
Status is derived from `is_active` + `has_auth`: active = `is_active && has_auth`, pending = `is_active && !has_auth`, inactive = `!is_active`. Action buttons are conditional on status: active → deactivate, inactive → activate, pending → resend + remove. The same `Card`-based row layout is used for all three states (unlike Floor's FeedCard which uses status-color left borders) — staff list is meant to feel administrative, not alert-y. The invite result dialog shows the invite URL in a copyable input even on success, so the owner can grab it manually if needed; the email_sent flag controls the success-vs-warning banner tone above it. Role label is rendered via `t(locale, "staff.role.${role}")`; super_admin is rendered literally since it has no i18n key.

### LiveOrders

File: `components/orders/live-orders.tsx`
Last updated: 2026-07-22

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Container        | (page-level, no wrapper) |
| Page header      | `mb-6` with title + subtitle, no top action button |
| Filter bar       | Status pill row (`All`/`Pending`/`In Progress`/`Ready`/`Delivered`/`Cancelled`) + search input |
| Group label      | `mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted` (location name + order count) |
| Grid             | `grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3` |
| Card             | `Card` with `border-l-4` status-color override |
| Status border    | pending=warning, in_progress=info, ready=success, delivered=muted, cancelled=error |
| Card header      | `flex items-start justify-between gap-2` (table label + customer name on left, status badge on right) |
| Status badge     | `rounded-full px-2 py-0.5 text-xs font-medium` (same color tokens as border) |
| Items list       | `mt-3 space-y-1`, each row: qty + name + (notes in italic muted) + subtotal right-aligned |
| Cancelled reason | `mt-2 rounded-sm bg-status-error/10 p-2 text-xs text-status-error` |
| Order notes      | Same shape as cancelled reason, but `bg-background` + `italic text-text-secondary` |
| Footer row       | `mt-3 flex items-center justify-between border-t border-border pt-2` (time-ago + total) |
| History section  | Collapsible (`historyOpen` state, defaults **open**), toggle button with rotating chevron SVG, header text via `t(locale, "orders.historySection", {count})` |
| History row      | `HistoryRow` — one row per delivered/cancelled order: table, customer name, status badge (or cancel reason in the badge slot instead of the status label), price (delivered only), relative time (`updated_at`, not `created_at`) |
| Empty state      | Same Feather-style icon + title + desc pattern as other pages (40×40 SVG, centered) |
| Loading          | Plain `text-text-muted` centered (no spinner — refresh is Realtime) |

**Pattern notes:**
Read-only view — no action buttons. Order cards follow the same status-left-border convention as TableCard and FeedCard but with the muted-info-warning color scheme (no special KDS dark variant). Groups by location, then by table within each location; sort oldest-first. Uses `timeAgo()` from `lib/utils` for the footer.
**Filtering is unified, not per-section:** a single `filtered` memo (status filter + search) is computed first, then partitioned into `activeByLocation` (pending/in_progress/ready) and `history` (delivered/cancelled) — both views derive from the same filtered set. This replaced an earlier version where the "active" section had a hardcoded status allowlist independent of the selected filter, which meant picking the "Delivered" filter silently showed nothing (the active section excluded delivered orders no matter what, and there was no delivered section at all). Don't reintroduce a second, independently-filtered code path for any new section — derive it from the one `filtered` memo.
**No client-side fade/removal of any kind.** An earlier version auto-removed `delivered` orders from local state 30 seconds after they arrived (`DELIVERED_FADE_MS` in `hooks/use-live-orders.ts`, mirroring the KDS's `ready`-card fade) — that's gone. This is the owner's full-day dashboard, not a kitchen queue; delivered/cancelled orders should stay visible (in History) for as long as the API returns them, which is the full 24h dashboard window (`DASHBOARD_WINDOW_MS`, not gated by the KDS's 2-minute `READY_STALE_MS` staleness window — that gating used to also (incorrectly) apply to `delivered` orders server-side, making them disappear ~2 minutes after completion regardless of the client-side fade).
The data comes from a tenant-scoped `GET /api/orders?tenant_id=` (owner-level view) and a tenant-scoped Realtime subscription on the `orders` table filtered by `tenant_id`.

### AnalyticsDashboard

File: `components/analytics/analytics-dashboard.tsx`
Last updated: 2026-07-22

| Property         | Class / Value     |
| ---------------- | ----------------- |
| Page header      | `mb-6 flex flex-wrap items-center justify-between gap-2` with title + subtitle on the left, range selector on the right |
| Range selector   | `flex gap-1 rounded-sm border border-border bg-surface p-0.5` with `bg-accent text-white` active and `text-text-secondary hover:bg-background` inactive — same pattern as the dashboard tab strip |
| Stat grid        | `grid grid-cols-2 gap-3 sm:grid-cols-4` (2-col on mobile, 4 on desktop) |
| Stat card        | `Card` with `text-xs font-medium uppercase tracking-wider text-text-muted` label + `text-2xl font-bold text-text-primary` value |
| Chart card       | `Card` with section heading + Recharts `LineChart` inside `h-64 w-full` `ResponsiveContainer` |
| Chart colors     | Stroke = `var(--color-accent)`, grid = `var(--color-border)`, axis text = `var(--color-text-muted)` — pulled from `:root` so they match the rest of the app |
| Tooltip          | Custom content style with surface bg + border token, text-secondary label — matches card aesthetic |
| Top items list   | `space-y-2` ordered list, rank number + name (truncate) + "{count} sold · {revenue}" |
| Peak hours chart | Recharts `BarChart`, `h-56 w-full` `ResponsiveContainer`. 24 bars (one per hour), x-axis ticks only at `0,3,6,9,12,15,18,21` to avoid label crowding. Bars colored via per-bar `<Cell>`: `var(--color-accent)` for the single busiest hour, translucent amber (`rgba(245,158,11,0.35)`) for the rest. One-line callout below the chart (`t(locale, "analytics.peakHourSummary", {label, count})`) names the peak hour explicitly instead of making the reader find the tallest bar |
| Empty state      | Plain `text-sm text-text-muted` paragraph (no icon) |

**Pattern notes:**
The "today" stats are always live-computed (no snapshot), the historical range uses lazily-generated daily snapshots (Postgres function `generate_daily_snapshot` in migration 020, called through the caller's own session-scoped Supabase client — **not** the admin/service-role client, which has no `auth.uid()` and always failed the function's own internal tenant check; this silently zeroed out every historical day until fixed). Top items + peak hours are computed live from `order_items` for the full range (snapshots only store per-day top-5 which is too lossy to union across 90 days). Recharts is the only charting dependency — see `library-docs.md` → "Recharts" for the CSS-var-token styling pattern used by both charts on this page.
**Peak hours used to be a hand-rolled 24-cell CSS grid, bucketed by `getUTCHours()`.** Replaced with the `BarChart` described above for two reasons: (1) a heatmap of 24 near-identical amber squares doesn't communicate "when" nearly as directly as bar height + an explicit peak-hour callout, and (2) bucketing by UTC hour was a real bug — it has no relationship to the restaurant's actual local schedule, so the "peak" appeared at whatever hour local lunch/dinner rush happens to fall at UTC. Hours are now bucketed via `Intl.DateTimeFormat` against a fixed `RESTAURANT_TIMEZONE` constant (`app/api/analytics/route.ts`) — there's no per-tenant timezone setting yet, so if multi-region tenants are ever supported this constant needs to become a real `tenants` column, not a wider justification for going back to UTC.
