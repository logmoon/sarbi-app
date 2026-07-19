# Memory — App-wide i18n (Task 06c)

_Last updated: 2026-07-19_

---

## What was built

### 06c App-wide i18n
- **`lib/i18n.ts`** — ~200 flat translation keys with full AR/FR/EN for every UI string across the entire app (customer menu, KDS, admin dashboard, auth screens, sidebar, tables, menu editor, metadata, time formatting). Exports `t(locale, key, params?)` with `{name}` interpolation, `getLocaleFromAcceptLanguage()` for server-side parsing, and `isSupportedLocale()` guard.
- **Middleware** (`app/middleware.ts`) — reads `sarbi-locale` cookie first, falls back to `Accept-Language` header, sets `x-locale` on forwarded request headers. Server components read this via `headers()` from `next/headers`.
- **`hooks/use-language.ts`** — collapsed from ~50 lines to ~15. Now reads from `LocaleContext` instead of managing independent `useState`. Re-exports `Locale` type for backward compatibility.

### LocaleProvider (React Context)
- **`components/layout/locale-provider.tsx`** — `"use client"` context provider. Holds locale state, provides `{ locale, changeLocale }` to entire app tree. Accepts `initialLocale` from server (no hydration mismatch). `changeLocale` syncs to `localStorage` + `cookie` + `document.documentElement.lang/dir`. Listens for `storage` event for cross-tab sync.
- **`app/layout.tsx`** — reads `x-locale` from headers, sets `lang` and `dir` on `<html>`, wraps `{children}` in `<LocaleProvider initialLocale={locale}>`.

### String replacement (~35 files)
- **Customer** (12 files): customer-shell, cart-drawer, action-buttons, my-orders-tab, tab-switcher, item-detail-modal, order-confirmation, are-you-with-modal, name-prompt-modal, language-toggle, menu-item-card, category-tabs
- **KDS** (3 files): kds-board, order-queue-card, cancel-order-modal
- **Admin menu** (4 files): menu-editor, category-form-dialog, item-card, item-edit-modal
- **Admin tables** (4 files): tables-manager, table-card, add-table-dialog, edit-table-dialog
- **Auth** (3 files): (auth)/layout, login/page, setup/page
- **Layout/UI primitives**: sidebar, dialog, confirm-dialog
- **Utilities/hooks/metadata**: lib/utils.ts (timeAgo), app/layout.tsx, customer page metadata, dashboard stub

### Sidebar improvements
- Made **sticky** — dashboard layout uses `h-screen overflow-hidden`, `<main>` scrolls independently
- **RTL support** — logical properties (`start-0`, `start-4`, `ms-auto`), mobile drawer animation reverses correctly via `rtl:translate-x-full`
- **Staff screens section** — appears below management items with divider + "Staff Screens" label. Links to `/kds/[locationId]` and `/floor/[locationId]`. Floor link shows "Soon" badge (not yet built). Dashboard layout fetches staff record and passes `staffLocationId` prop.

### FileUpload component
- **`components/ui/file-upload.tsx`** — reusable drag-and-drop file input with full i18n. States: empty drop zone, existing image preview, file selected (name + size + cancel + upload), uploading (button dimmed), error. Replaces native `<input type="file">` (whose "Choose File" text is browser-controlled). Used by `item-edit-modal`.

### Fixes
- **Switch RTL** — thumb uses `ms-0.5` (logical margin) + `translate-x-4 rtl:-translate-x-4`
- **Template literal bug** in tables-manager print window title
- **Root layout** — hardcoded `lang="en"` replaced with server-detected locale
- **Cross-tab locale sync** — `storage` event listener in LocaleProvider

---

## Decisions made

- **Flat key structure** — simpler to grep and type than nested. ~200 keys, no external i18n library.
- **Middleware sets `x-locale` header** — cookie first, Accept-Language fallback. No URL changes, no redirects.
- **React Context for locale state** — replaces per-component useState. One source of truth. All `t(locale, 'key')` calls re-render together.
- **Initial locale from server prop** — `initialLocale` passed to LocaleProvider from `x-locale` header. No hydration mismatch (client and server agree on first render).
- **Cookie ↔ localStorage dual sync** — toggle sets both. Cookie for SSR persistence, localStorage for cross-tab `storage` event.
- **API error responses stay English** — translated error codes on client only when genuinely user-facing.
- **`Locale` type lives in `lib/i18n.ts`** — imported from there everywhere. `hooks/use-language.ts` re-exports for backward compat.

---

## Problems solved

- **Language toggle only changed one component** — each `useLanguage()` had independent `useState("fr")`. Fixed by sharing state via React Context.
- **Switch toggle broken in RTL** — thumb used `ml-0.5` + `translate-x-4` which don't reverse in RTL. Fixed with `ms-0.5` + `rtl:-translate-x-4`.
- **File input text always English** — browser-native "Choose File" can't be translated. Replaced with custom `FileUpload` component using `t()`.
- **Cross-tab language sync** — changing language in one tab didn't update other tabs. Fixed with `window.addEventListener("storage", ...)` in LocaleProvider.
- **Hydration mismatch** — client components started as `"fr"` while server rendered correct locale. Fixed by passing `initialLocale` prop from server to LocaleProvider.
- **Template literal `${}` bug** in print window title — used `{}` instead of `${}` inside backtick template.
- **A regression on `useLanguage`** — `useLanguage` no longer sync `document.documentElement.dataset.locale` attribute on change and mount, since the initial value is now provided by the server and should not conflict with client. This is an ongoing consideration for future updates.

---

## Current state

- Phase 1–2: Complete
- Phase 3 (Customer Product): 06, 06b, 06c done ✅
- Phase 4 (Operations): 07 (Session Lifecycle) + 08 (KDS) done. 09 (Floor Staff App) not started.
- Phase 5 (Management): Not started.

---

## Next session starts with

09. Floor Staff App (Live Feed + Session History) — Clear Table logic already exists from Task 07, this is building the floor staff's own UI: live feed of order-ready / waiter-call / bill-request / check-table events, session history with running totals, and the "Clear Table" button. Move/duplicate the existing button from the dashboard Tables page.

---

## Open questions

- (Carried over) Should `check_needed` events ever auto-resolve, or only via explicit staff action? Not urgent until Task 09's live feed exists.
- Migrations 015/016 + KDS changes + this session's i18n work still need to be tested against the developer's real Supabase project and pushed — nothing has been pushed to `origin/main`.
- `document.documentElement.dataset.locale` is no longer synced on change/mount since the initial value comes from the server. This is intentional for now but worth a quick sanity check if any RTL styling depends on it beyond the `dir` attribute.
