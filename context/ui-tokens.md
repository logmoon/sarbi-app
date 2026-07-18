# UI Tokens

Design tokens for this project. Use these everywhere — never hardcode values or use raw framework color classes.

---

## Colors

### Accent / Brand

| Token | Hex | Usage |
|---|---|---|
| `--color-accent` | `#F59E0B` | Primary actions, CTAs, active states |
| `--color-accent-hover` | `#D97706` | Hover state for accent elements |
| `--color-accent-light` | `#FEF3C7` | Light accent backgrounds, highlights |
| `--color-accent-dark` | `#B45309` | Dark accent text on light backgrounds |

### Backgrounds

| Token | Hex | Usage |
|---|---|---|
| `--color-background` | `#F8F9FA` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals, drawers |

### Text

| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#111827` | Headings, body text |
| `--color-text-secondary` | `#6B7280` | Labels, descriptions, metadata |
| `--color-text-muted` | `#9CA3AF` | Placeholders, disabled text |

### Status

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#10B981` | Order ready, confirmations, active sessions |
| `--color-warning` | `#F59E0B` | Time thresholds, caution states |
| `--color-error` | `#EF4444` | Cancelled orders, validation errors, alerts |
| `--color-info` | `#3B82F6` | Neutral informational badges |

### Borders

| Token | Hex | Usage |
|---|---|---|
| `--color-border` | `#E5E7EB` | Card borders, dividers, input borders |
| `--color-border-focus` | `#F59E0B` | Input focus rings (matches accent) |

### KDS (fixed dark theme)

The KDS screen is always dark, independent of the rest of the app (there is no light/dark toggle elsewhere — this is a dedicated palette for one full-screen surface).

| Token | Hex | Usage |
|---|---|---|
| `--color-kds-background` | `#111827` | KDS page background |
| `--color-kds-surface` | `#1F2937` | Order cards |
| `--color-kds-text` | `#F9FAFB` | Primary text on dark surfaces |
| `--color-kds-text-secondary` | `#9CA3AF` | Metadata, timestamps, secondary labels |
| `--color-kds-border-subtle` | `#374151` | Neutral dividers/borders where status color doesn't apply |

Status border colors reuse the existing `--color-success` / `--color-warning` / `--color-error` tokens — they're vivid enough to read on the dark surface without a separate dark-specific set.

---

## Typography

| Element | Size | Weight | Color | Line Height |
|---|---|---|---|---|
| Page title | 24px / 1.5rem | 700 | `--color-text-primary` | 1.2 |
| Section heading | 20px / 1.25rem | 600 | `--color-text-primary` | 1.3 |
| Card heading | 16px / 1rem | 600 | `--color-text-primary` | 1.4 |
| Body | 16px / 1rem | 400 | `--color-text-primary` | 1.5 |
| Small / Label | 14px / 0.875rem | 500 | `--color-text-secondary` | 1.4 |
| Caption | 12px / 0.75rem | 400 | `--color-text-muted` | 1.4 |
| KDS table label | 32px / 2rem | 700 | `--color-kds-text` | 1.0 |
| KDS item name | 20px / 1.25rem | 400 | `--color-kds-text` | 1.3 |

Font stack: `Inter`, `Noto Sans Arabic`, `sans-serif`

---

## Spacing

4px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

| Token | Value | Common Usage |
|---|---|---|
| `--space-1` | 4px | Tight gaps (icon-to-text) |
| `--space-2` | 8px | Default small gap |
| `--space-3` | 12px | Form field gaps |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Modal padding |
| `--space-6` | 24px | Page section spacing |
| `--space-8` | 32px | Major section dividers |
| `--space-10` | 40px | Page-level spacing |
| `--space-12` | 48px | Hero/large gaps |
| `--space-16` | 64px | Maximum spacing |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Buttons, inputs, badges |
| `--radius-md` | 8px | Cards |
| `--radius-lg` | 12px | Modals, drawers |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift (badges, small cards) |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, drawers |

---

## Component Tokens

### Cards
```
background: --color-surface (#FFFFFF)
border: 1px solid --color-border (#E5E7EB)
border-radius: --radius-md (8px)
padding: --space-4 (16px)
```

### Buttons
```
primary background: --color-accent (#F59E0B)
primary text: #FFFFFF
primary hover: --color-accent-hover (#D97706)
secondary background: --color-surface (#FFFFFF)
secondary border: 1px solid --color-border (#E5E7EB)
secondary text: --color-text-primary (#111827)
secondary hover: --color-background (#F8F9FA)
```

### Inputs
```
background: --color-surface (#FFFFFF)
border: 1px solid --color-border (#E5E7EB)
border-radius: --radius-sm (6px)
focus ring: 2px solid --color-accent (#F59E0B)
```

### KDS Cards (dark variant)
```
background: --color-kds-surface (#1F2937)
border: 2px solid (status-dependent: --color-error pending / --color-warning in_progress / --color-success ready)
border-radius: --radius-md (8px)
padding: --space-4 (16px)
text: --color-kds-text (#F9FAFB)
secondary text: --color-kds-text-secondary (#9CA3AF)
```
