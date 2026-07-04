# UI Rules

Rules for building UI in this project. Must stay consistent across every component and every session.

---

## Layout

- Max content width: 1200px on dashboard pages, full-width on KDS and customer menu
- Page padding: `--space-6` (24px) on desktop, `--space-4` (16px) on mobile
- Section gap: `--space-8` (32px) between major page sections
- Card grid: responsive, 1 column on mobile, 2-3 on tablet/desktop
- Dashboard sidebar: fixed 240px width on desktop, collapsible on tablet, hidden behind hamburger on mobile

---

## Navigation

- Sidebar uses pill-style active state: `--color-accent` background, white text
- Inactive items: `--color-text-secondary` text, transparent background
- Hover: `--color-background` background
- Section dividers in sidebar: thin `--color-border` line with section label above
- Current location always indicated via active nav state and page title

---

## Cards

- White background, 1px `--color-border`, `--radius-md` (8px)
- Padding: `--space-4` (16px)
- Shadow: none by default, `--shadow-md` on hover for interactive cards
- Status-dependent left border on order/event cards (4px, status color)
- KDS cards: dark variant (`#1F2937` bg, `#F9FAFB` text), no shadow, 2px status-colored border

---

## Typography Hierarchy

| Level | Use | Size | Weight | Color |
|---|---|---|---|---|
| H1 | Page title | 24px | 700 | `--color-text-primary` |
| H2 | Section heading | 20px | 600 | `--color-text-primary` |
| H3 | Card heading | 16px | 600 | `--color-text-primary` |
| Body | Paragraphs, lists | 16px | 400 | `--color-text-primary` |
| Label | Form labels, badges | 14px | 500 | `--color-text-secondary` |
| Caption | Timestamps, metadata | 12px | 400 | `--color-text-muted` |

---

## Buttons

- **Primary:** `--color-accent` bg, white text, `--color-accent-hover` on hover. Used for main actions (Place Order, Start Order, Save).
- **Secondary:** White bg, `--color-border` border, `--color-text-primary` text. Used for secondary actions (Cancel, Back).
- **Danger:** `--color-error` bg, white text. Used for destructive actions (Delete, Cancel Order).
- **Ghost:** Transparent bg, `--color-text-secondary` text. Used for icon buttons, tertiary actions.
- All buttons: `--radius-sm` (6px), min height 40px, min width 40px for touch targets.
- Disabled state: 50% opacity, `cursor-not-allowed`.

---

## Forms

- Input background: `--color-surface`, border: `--color-border`, radius: `--radius-sm`
- Focus ring: 2px solid `--color-accent` (matches brand)
- Labels: `--color-text-secondary`, 14px, positioned above input
- Error state: border `--color-error`, helper text below in `--color-error` color
- Placeholder text: `--color-text-muted`
- Inline validation on blur, not just on submit
- Preserve user input on validation failure — never clear a field because another was wrong

---

## Empty States

- Every empty section must have one: centered icon/illustration, heading, description, and optional action button
- Heading: "No [items] yet" (H3, `--color-text-primary`)
- Description: 1-2 sentences explaining what goes here and how to add the first one (`--color-text-secondary`)
- Action button: primary CTA to create the first item

---

## Do Nots

- Never use raw Tailwind color classes (`bg-amber-500`, `text-gray-700`) — always use CSS variable tokens via `--color-*`
- Never hardcode hex values in component files — reference tokens from `ui-tokens.md`
- Never use emoji as UI elements (icons should be SVG or icon library)
- Never ship a card with `rounded-xl` + soft shadow on every surface — hierarchy matters, use `--radius-md` by default, `--shadow-md` only on interactive/hovered cards
- Never use centered-hero-with-emoji as the default empty/loading pattern — keep it functional
- Never remove focus outlines without replacing them with a visible alternative
- Never use placeholder text as a substitute for a `<label>`
- Never convey state (error, success, required) by color alone — pair with icon or text
- Never use glassmorphism or neumorphism as a default card style
- Never ship generic un-customized component library styling as final
