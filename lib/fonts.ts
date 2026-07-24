import { Playfair_Display, Quicksand, Fraunces } from "next/font/google";

// Curated heading-font pairings for tenant menu theming (see lib/brand.ts).
// "modern" deliberately has no entry here — it reuses --font-inter, which
// is already loaded globally in app/layout.tsx, so picking the default
// preset costs zero extra font weight.
//
// These are declared once, at module scope (required by next/font), and
// imported wherever a tenant-themed surface needs them: the live customer
// menu (app/(public)/layout.tsx) and the settings page's preview
// (app/(platform)/dashboard/settings/page.tsx). Importing the same
// instances in both places means the preview renders with the exact same
// self-hosted font files the real menu will use — no separate config to
// drift out of sync.
export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

// A soft, warm serif with a much bigger x-height than a classic Didone
// serif like Playfair Display, so it stays readable at UI text sizes
// instead of thinning out — Cormorant Garamond was tried here first and
// looked "small and weird" at heading sizes below display scale; Fraunces
// is built for exactly this range and reads as genuinely distinct from
// Playfair rather than "another thin serif".
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

// Applied as a className on any wrapping element that contains
// tenant-themed content, so `var(--font-playfair)` etc. resolve wherever
// lib/brand.ts#themeStyleVars points --font-heading at one of them.
export const menuFontVariables = `${playfairDisplay.variable} ${quicksand.variable} ${fraunces.variable}`;
