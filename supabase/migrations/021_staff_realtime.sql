-- ============================================================================
-- Add staff to Supabase Realtime publication for live updates on the staff page
-- ============================================================================
-- When an invite is accepted (auth_id gets set), toggled inactive/active, or
-- a new member is added, the staff list updates in real time — no refresh
-- needed. Follows the same pattern as sessions/orders/table_events (migration
-- 015), with REPLICA IDENTITY FULL so UPDATE/DELETE payloads carry the full
-- row including tenant_id for the postgres_changes filter.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'staff'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
  END IF;
END $$;

ALTER TABLE public.staff REPLICA IDENTITY FULL;
