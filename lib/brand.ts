import type { CSSProperties } from "react";

export type BrandColors = {
  primary: string;
  accent?: string;
};

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function isValidHex(value: unknown): value is string {
  return typeof value === "string" && HEX_PATTERN.test(value);
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

// Returns a CSSProperties object that overrides the project's accent
// tokens on a per-element basis. Applied as inline `style` on the root
// element of a tenant-branded surface (currently the customer menu only —
// admin pages use the default Sarbi amber by design, see project invariant
// that brand is owner-customer scoped for V1).
//
// Why this exists: Tailwind's `bg-accent` resolves to `var(--color-accent)`,
// but the hover / focus / light variants (`--color-accent-hover`,
// `--color-accent-light`, `--color-border-focus`, `--color-accent-dark`)
// are NOT set anywhere when we inject brand colors as plain key→value
// pairs. Without this helper, hover states fall back to the default Sarbi
// amber even when the owner customized the brand. We compute the variants
// here so the brand flows through the entire interaction surface.
export function brandStyleVars(colors: BrandColors | null | undefined): CSSProperties {
  if (!colors || !isValidHex(colors.primary)) {
    return {};
  }
  const primary = colors.primary.toUpperCase();
  return {
    "--color-accent": primary,
    "--color-accent-hover": darken(primary, 0.12),
    "--color-accent-light": lighten(primary, 0.36),
    "--color-accent-dark": darken(primary, 0.22),
    "--color-border-focus": primary,
  } as CSSProperties;
}

// Coerces whatever the DB has (which is `any` JSONB) into our typed shape
// with safe fallbacks. Returns `null` if no usable primary is present.
export function parseBrandColors(raw: unknown): BrandColors | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const primary = obj.primary;
  if (!isValidHex(primary)) return null;
  return {
    primary: primary.toUpperCase(),
    accent: isValidHex(obj.accent) ? (obj.accent as string).toUpperCase() : undefined,
  };
}
