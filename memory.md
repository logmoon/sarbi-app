# Memory

_Last updated: 2026-07-04_

---

## What was built

- **Project scaffold** — Next.js 14, App Router, TypeScript strict mode, Tailwind CSS
- **Design token system** — All tokens from `ui-tokens.md` wired into `tailwind.config.ts` and `globals.css` as CSS custom properties. Colors, spacing (4px base), radii, shadows, typography all use `var(--color-*)` references.
- **Fonts** — Inter (latin) + Noto Sans Arabic (arabic) loaded via `next/font/google`, exposed as CSS variables `--font-inter` and `--font-noto-sans-arabic`
- **Supabase clients** — `lib/supabase/client.ts` (browser, `createBrowserClient`), `server.ts` (server, `createServerClient` with cookie handling), `admin.ts` (service role, bypasses RLS). All use `getEnv()` helper that throws descriptive errors if vars are missing.
- **Redis client** — `lib/redis.ts` with Upstash, same `getEnv()` pattern
- **Utilities** — `lib/utils.ts`: `cn()` (clsx + tailwind-merge), `formatPrice()` (TND currency, guards NaN/negatives), `timeAgo()` (handles past and future dates)
- **Validators** — `lib/validators.ts` with `createOrderSchema` placeholder
- **Env template** — `.env.local.example` with all 6 required vars
- **PostCSS** — tailwindcss + autoprefixer
- **Root page** — `app/page.tsx` redirects to `/login`
- **Root layout** — `<html>` has `suppressHydrationWarning` for child layout lang override

## Decisions made

- Full design token system wired up in step 01 (not deferred) — every downstream feature depends on these tokens
- No `src/` directory — `app/`, `lib/`, `components/` at project root
- `getEnv()` pattern for env vars instead of non-null assertions — fails fast with descriptive error
- `formatPrice` takes millimes (not TND float) — divide by 1000 internally
- `app/page.tsx` redirects to `/login` — root URL is not a customer-facing route

## Problems solved

- `create-next-app` conflicts with existing files — created in `/tmp` then copied over
- `await cookies()` in Next.js 14 is synchronous — removed unnecessary await
- Default boilerplate page had wrong font vars (`--font-geist-sans`) — replaced entirely
- `<html lang="en">` hardcoded — added `suppressHydrationWarning` so child layouts can override for Arabic RTL
- Missing `@types/qrcode` — installed as devDependency
- Missing `autoprefixer` in postcss — installed and added to config

## Current state

Step 01 complete. Scaffold builds clean (`npm run build` passes), types check clean (`tsc --noEmit` passes). No runtime code yet — just the foundation layer.

## Next session starts with

Run `/architect` automatically on step 02 (Supabase Auth + Role System) before touching any code. The session protocol requires this as a hard gate — do not skip it.

## Open questions

- None from this session. Step 02 is well-defined in build-plan.md.
