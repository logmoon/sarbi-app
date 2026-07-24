-- ============================================================================
-- Tenant menu cover image
-- ============================================================================
-- A hero/banner image for the top of the customer-facing menu, alongside
-- the existing `logo_url`. Uploaded to the same `menu-images` storage
-- bucket (under a `covers/` prefix) — that bucket's RLS policies (migration
-- 011) are already scoped to the bucket, not a path prefix, so no storage
-- policy changes are needed.
-- ============================================================================

ALTER TABLE tenants
  ADD COLUMN cover_url TEXT;
