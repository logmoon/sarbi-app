# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception.

---

## Engineering Mindset

- Think before implementing
- Read context files first — never assume
- Scope is sacred — only build what the current feature requires
- Every feature must be immediately testable
- One thing at a time

---

## Language

- TypeScript strict mode. No `any`. No `@ts-ignore`. No `@ts-expect-error` unless accompanied by a comment explaining why and a task to remove it.
- Prefer `type` over `interface` for object shapes (consistent with Supabase generated types).
- Use `readonly` on function parameters that should not be mutated.
- Use `as const` for literal arrays and objects that won't change.
- Return types on all exported functions (no implicit `any` return).

---

## Framework Conventions

- **Next.js App Router only.** No Pages Router. All routes use `layout.tsx` + `page.tsx`.
- **Server Components by default.** Only add `"use client"` when the component genuinely needs interactivity, state, or browser APIs.
- **Server Actions** for mutations from forms. API routes for programmatic endpoints consumed by multiple clients.
- **Route groups:** `(auth)` for unauthenticated pages, `(platform)` for authenticated admin pages, `(public)` for customer menu.
- **Middleware** handles auth session refresh and route protection. Never duplicate auth checks in individual pages when middleware covers the route.

---

## File and Folder Naming

- **Components:** `kebab-case.tsx` — `order-card.tsx`, `cart-drawer.tsx`
- **Utilities:** `kebab-case.ts` — `format-price.ts`, `time-ago.ts`
- **Hooks:** `use-kebab-case.ts` — `use-realtime.ts`, `use-cart.ts`
- **API routes:** Follow Next.js convention — `app/api/orders/route.ts`
- **DB tables:** `snake_case` in SQL — `order_items`, `table_events`
- **DB migrations:** Numbered prefix — `001_create_tenants.sql`, `002_create_locations.sql`
- **One component per file.** Named export matches the file name.

---

## Component / Module Structure

```tsx
// 1. Imports (external, then internal by distance)
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// 2. Types / interfaces
type OrderCardProps = {
  order: Order
  onStart: (id: string) => void
}

// 3. Component
export function OrderCard({ order, onStart }: OrderCardProps) {
  // 4. Hooks
  // 5. Derived state / computations
  // 6. Render
}
```

---

## Error Handling

- **API routes:** Return structured `{ error: string, code: string }` with appropriate HTTP status. Never return raw caught errors to the client.
- **Server components:** Let errors propagate to the nearest `error.tsx` boundary. Do not swallow errors in server components.
- **Client components:** Use React error boundaries for rendering errors. For async operations (API calls), catch and display inline — never silently fail.
- **Database operations:** Check `error` property on every Supabase response. If `error` is not null, log it server-side and return a user-friendly message.
- **Validation:** Validate at the API route boundary with Zod. Return 400 with specific field errors. Never validate only on the client.

---

## Environment Variables

| Variable | Used In | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key — bypasses RLS. NEVER expose to client. |
| `UPSTASH_REDIS_REST_URL` | Server only | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Upstash Redis REST token |
| `RESEND_API_KEY` | Server only | Resend email API key |

---

## Dependencies

Nothing added to `package.json` without updating this section.

| Package | Purpose |
|---|---|
| `next` | Framework |
| `react`, `react-dom` | UI library |
| `typescript` | Type system |
| `tailwindcss` | Styling |
| `@supabase/supabase-js` | Supabase client |
| `@supabase/ssr` | Supabase SSR integration for Next.js |
| `@upstash/redis` | Upstash Redis client |
| `@upstash/ratelimit` | Rate limiting |
| `resend` | Email sending |
| `qrcode` | QR code generation |
| `zod` | Input validation |
| `clsx` | Conditional classnames |
| `tailwind-merge` | Tailwind class deduplication |
