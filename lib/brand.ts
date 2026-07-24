import type { CSSProperties } from "react";

export type SurfaceTone = "light" | "warm" | "sage" | "blush" | "slate" | "dark";
export type FontPreset = "modern" | "classic" | "playful" | "bold";
export type LayoutPreset = "grid" | "compact" | "magazine";

export type MenuTheme = {
  primary: string;
  accent?: string;
  surface?: SurfaceTone;
  font?: FontPreset;
  layout?: LayoutPreset;
};

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function isValidHex(value: unknown): value is string {
  return typeof value === "string" && HEX_PATTERN.test(value);
}

const SURFACE_TONES: readonly SurfaceTone[] = ["light", "warm", "sage", "blush", "slate", "dark"];
const FONT_PRESETS: readonly FontPreset[] = ["modern", "classic", "playful", "bold"];
const LAYOUT_PRESETS: readonly LayoutPreset[] = ["grid", "compact", "magazine"];

function isSurfaceTone(value: unknown): value is SurfaceTone {
  return typeof value === "string" && (SURFACE_TONES as readonly string[]).includes(value);
}
function isFontPreset(value: unknown): value is FontPreset {
  return typeof value === "string" && (FONT_PRESETS as readonly string[]).includes(value);
}
function isLayoutPreset(value: unknown): value is LayoutPreset {
  return typeof value === "string" && (LAYOUT_PRESETS as readonly string[]).includes(value);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

// Mix two colors in linear-RGB-ish space (gamma-corrected via per-channel
// lerp — good enough for hover/light/dark variants). amount = 0 returns
// `base`; amount = 1 returns `mix`.
function mix(base: string, mixColor: string, amount: number): string {
  const [br, bg, bb] = hexToRgb(base);
  const [mr, mg, mb] = hexToRgb(mixColor);
  return rgbToHex(
    br + (mr - br) * amount,
    bg + (mg - bg) * amount,
    bb + (mb - bb) * amount
  );
}

// Darken by mixing with black. amount in [0, 1] — typical use 0.10–0.25.
function darken(color: string, amount: number): string {
  return mix(color, "#000000", amount);
}

// Lighten by mixing with white. amount in [0, 1] — typical use 0.30–0.40
// for a soft tinted background.
function lighten(color: string, amount: number): string {
  return mix(color, "#ffffff", amount);
}

// Surface tone overrides. "light" is intentionally empty — it's the same
// as app/globals.css's :root defaults, so no override needed. All the
// light-family tones (warm/sage/blush/slate) only override
// background/surface/border — text tokens stay the default dark, since
// each is a subtle tint, not a real light/dark switch. "dark" is the one
// tone that also flips text tokens, and deliberately reuses the same
// values as the KDS's fixed dark theme (app/globals.css) rather than
// inventing a new dark palette.
const SURFACE_TONE_VARS: Record<SurfaceTone, Record<string, string>> = {
  light: {},
  warm: {
    "--color-background": "#FAF5EC",
    "--color-surface": "#FFFDF8",
    "--color-border": "#EDE3D3",
  },
  sage: {
    "--color-background": "#F3F6F1",
    "--color-surface": "#FAFCF9",
    "--color-border": "#DCE5D8",
  },
  blush: {
    "--color-background": "#FAF1F0",
    "--color-surface": "#FFF8F7",
    "--color-border": "#F0DAD8",
  },
  slate: {
    "--color-background": "#F1F3F5",
    "--color-surface": "#F9FAFB",
    "--color-border": "#DDE2E7",
  },
  dark: {
    "--color-background": "#111827",
    "--color-surface": "#1F2937",
    "--color-border": "#374151",
    "--color-text-primary": "#F9FAFB",
    "--color-text-secondary": "#9CA3AF",
    "--color-text-muted": "#6B7280",
  },
};

// Which CSS variable --font-heading should point at for each preset.
// "modern" reuses --font-inter (already loaded app-wide in app/layout.tsx)
// rather than a dedicated font, so the default preset costs nothing extra.
// The other three are loaded via lib/fonts.ts wherever tenant-themed
// content renders (the customer menu, and the settings preview).
// Noto Sans Arabic is always chained in afterward: none of the three
// display fonts have Arabic glyph coverage, so Arabic text in a tenant's
// menu falls back to it automatically per-character rather than silently
// rendering in the browser's default serif/sans.
const FONT_PRESET_VARS: Record<FontPreset, string> = {
  modern: "var(--font-inter)",
  classic: "var(--font-playfair)",
  playful: "var(--font-quicksand)",
  bold: "var(--font-fraunces)",
};

// Returns a CSSProperties object that overrides the project's accent,
// surface, and heading-font tokens on a per-element basis. Applied as
// inline `style` on the root element of a tenant-branded surface
// (currently the customer menu only — admin pages use the default Sarbi
// amber/Inter by design, see project invariant that brand is
// owner-customer scoped for V1).
//
// Why this exists: Tailwind's `bg-accent` resolves to `var(--color-accent)`,
// but the hover / focus / light variants (`--color-accent-hover`,
// `--color-accent-light`, `--color-border-focus`, `--color-accent-dark`)
// are NOT set anywhere when we inject brand colors as plain key→value
// pairs. Without this helper, hover states fall back to the default Sarbi
// amber even when the owner customized the brand. We compute the variants
// here so the brand flows through the entire interaction surface — and,
// as of the surface-tone/font additions, so does the rest of the theme.
export function themeStyleVars(theme: MenuTheme | null | undefined): CSSProperties {
  if (!theme || !isValidHex(theme.primary)) {
    return {};
  }
  const primary = theme.primary.toUpperCase();
  const surfaceVars = SURFACE_TONE_VARS[theme.surface ?? "light"];
  const fontVar = FONT_PRESET_VARS[theme.font ?? "modern"];

  return {
    "--color-accent": primary,
    "--color-accent-hover": darken(primary, 0.12),
    "--color-accent-light": lighten(primary, 0.36),
    "--color-accent-dark": darken(primary, 0.22),
    "--color-border-focus": primary,
    ...surfaceVars,
    "--font-heading": `${fontVar}, var(--font-noto-sans-arabic), sans-serif`,
  } as CSSProperties;
}

// Coerces whatever the DB has (JSONB, so `any`) into our typed shape with
// safe fallbacks. Returns `null` only if there's no usable primary color —
// unrecognized/missing surface, font, or layout values fall back to their
// defaults individually rather than invalidating the whole theme, so an
// old tenant record (or a future removed preset) never breaks rendering.
export function parseMenuTheme(raw: unknown): MenuTheme | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const primary = obj.primary;
  if (!isValidHex(primary)) return null;
  return {
    primary: primary.toUpperCase(),
    accent: isValidHex(obj.accent) ? (obj.accent as string).toUpperCase() : undefined,
    surface: isSurfaceTone(obj.surface) ? obj.surface : "light",
    font: isFontPreset(obj.font) ? obj.font : "modern",
    layout: isLayoutPreset(obj.layout) ? obj.layout : "grid",
  };
}
