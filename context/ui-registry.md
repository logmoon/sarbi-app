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
