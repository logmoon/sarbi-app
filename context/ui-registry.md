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
Specialization of Dialog for delete/destructive confirmations. Accepts `variant` prop (danger or primary) to toggle button style. Loading state shows "Deleting..." on confirm button.

### TableCard

File: `components/tables/table-card.tsx`
Last updated: 2026-07-09

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

**Pattern notes:**
TableCard has three visual states derived from `is_active` + `has_active_session`: occupied (green border + badge), available (default), inactive (muted border + 60% opacity). Uses the project's status-border convention (4px left border) from ui-rules.md. QR preview uses inline SVG (no canvas), with a subtle show/hide toggle for the public code.

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
