# Library Docs

Project-specific usage patterns for every third-party library. Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. Check if an MCP server or built-in subagent is configured for docs lookup — use it if available
2. Read this file for project-specific patterns
3. Fall back to official documentation only if neither of the above apply

---

## Next.js 14 (App Router)

**Project conventions:**
- All routes use `layout.tsx` + `page.tsx`. No `getServerSideProps` or `getStaticProps`.
- Route groups: `(auth)`, `(platform)`, `(public)` — parentheses don't affect URL.
- API routes use `route.ts` with exported named functions (`GET`, `POST`, `PATCH`, `DELETE`).
- Server Components by default. Add `"use client"` only when needed.

**Middleware pattern (auth session refresh):**

```ts
// app/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/kds') ||
    request.nextUrl.pathname.startsWith('/floor') ||
    request.nextUrl.pathname.startsWith('/superadmin')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
```

**Server Component auth check:**

```tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // User is authenticated — fetch data, render page
}
```

**API route pattern:**

```ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  // Validate with Zod, call Supabase, return response
  return NextResponse.json({ data }, { status: 200 })
}
```

---

## Supabase (PostgreSQL + Auth + Realtime + Storage)

**Client setup (browser):**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Client setup (server — service role, bypasses RLS):**

```ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

**Auth — custom access token hook (role injection):**

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.staff
  WHERE auth_id = (event->>'user_id')::text;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', 'null');
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;
```

**Auth — sign up:**

```ts
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
})
```

**Auth — sign in:**

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword',
})
```

**Realtime — subscribe to order inserts for a location:**

```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const channel = supabase
  .channel('orders-location-123')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
      filter: 'location_id=eq.123',
    },
    (payload) => {
      console.log('New order:', payload.new)
      // Play kitchen chime, update UI
    }
  )
  .subscribe()

// Cleanup on unmount
supabase.removeChannel(channel)
```

**Realtime — subscribe to table events:**

```ts
const channel = supabase
  .channel('events-location-123')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'table_events',
      filter: 'location_id=eq.123',
    },
    (payload) => {
      console.log('New event:', payload.new)
      // Play floor alert, update feed
    }
  )
  .subscribe()
```

**Storage — upload image:**

```ts
const { data, error } = await supabase.storage
  .from('menu-images')
  .upload(`items/${tenantId}/${filename}`, file, {
    contentType: 'image/jpeg',
    upsert: true,
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('menu-images')
  .getPublicUrl(`items/${tenantId}/${filename}`)
```

---

## Upstash Redis

**Client setup:**

```ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

**Rate limiting:**

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  prefix: '@upstash/ratelimit',
})

// In API route:
const identifier = request.headers.get('x-forwarded-for') ?? 'anonymous'
const { success, limit, remaining } = await ratelimit.limit(identifier)

if (!success) {
  return NextResponse.json(
    { error: 'Too many requests', code: 'RATE_LIMITED' },
    { status: 429 }
  )
}
```

---

## Resend (Email)

**Setup:**

```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
```

**Send email from API route:**

```ts
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email, name } = await request.json()

  const { data, error } = await resend.emails.send({
    from: 'Sarbi <noreply@sarbi.tn>',
    to: [email],
    subject: 'Welcome to Sarbi',
    html: `<p>Welcome ${name}! Your restaurant account is ready.</p>`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

---

## Tailwind CSS

**Theme configuration (tailwind.config.ts):**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        status: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          error: 'var(--color-error)',
          info: 'var(--color-info)',
        },
        border: 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'sans-serif'],
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [],
}

export default config
```

**CSS variables (globals.css):**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-background: #F8F9FA;
  --color-surface: #FFFFFF;
  --color-accent: #F59E0B;
  --color-accent-hover: #D97706;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  --color-border: #E5E7EB;
}
```

**Usage — conditional classes:**

```tsx
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage:
<button className={cn(
  'px-4 py-2 rounded-lg font-medium',
  isActive && 'bg-accent text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
```

---

## qrcode (npm package)

**Generate QR as data URL (browser):**

```ts
import QRCode from 'qrcode'

const url = await QRCode.toDataURL('https://menu.sarbi.tn/cafe-azur/table/abc12345', {
  width: 300,
  margin: 2,
  color: {
    dark: '#111827',
    light: '#FFFFFF',
  },
})

// Use as <img src={url} />
```

**Generate QR as SVG string (server):**

```ts
import QRCode from 'qrcode'

const svg = await QRCode.toString('https://menu.sarbi.tn/cafe-azur/table/abc12345', {
  type: 'svg',
  width: 300,
})
```

**Download QR code in browser:**

```ts
import QRCode from 'qrcode'

async function downloadQR(code: string, label: string) {
  const url = await QRCode.toDataURL(code, { width: 300, margin: 2 })
  const link = document.createElement('a')
  link.href = url
  link.download = `${label}-qr.png`
  link.click()
}
```

---

## Zod (Validation)

**Schema definition:**

```ts
import { z } from 'zod'

export const createOrderSchema = z.object({
  session_id: z.string().uuid(),
  items: z.array(z.object({
    item_id: z.string().uuid(),
    quantity: z.number().int().positive().max(99),
    notes: z.string().max(500).optional(),
  })).min(1).max(50),
  notes: z.string().max(1000).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
```

**Validation in API route:**

```ts
import { createOrderSchema } from '@/lib/validators'

export async function POST(request: Request) {
  const body = await request.json()
  const result = createOrderSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', code: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const input = result.data
  // Proceed with validated input
}
```

---

## clsx + tailwind-merge

Always use the `cn()` utility (defined in lib/utils.ts) instead of raw `clsx` or string concatenation. This prevents Tailwind class conflicts when conditional classes are used.

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  variant === 'error' && 'error-class'
)} />
```
