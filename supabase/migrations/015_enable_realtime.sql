-- ============================================================================
-- Enable Supabase Realtime for tables the app subscribes to via postgres_changes
-- ============================================================================
-- Adding RLS policies (see 014_anon_realtime_policies.sql) is necessary but not
-- sufficient — tables also need to be added to the `supabase_realtime`
-- publication before Postgres will broadcast changes over the Realtime socket.
-- This was previously missing, which is why owner/customer UIs never received
-- live updates regardless of RLS being correct.
--
-- Wrapped in existence checks so this migration is safe to re-run even if a
-- table was already added manually via the Dashboard's Replication screen.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'table_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.table_events;
  END IF;
END $$;

-- REPLICA IDENTITY FULL ensures the full row (not just the primary key) is
-- available on UPDATE/DELETE change payloads, which postgres_changes filters
-- (e.g. session_id=eq.<uuid>) need to reliably match against. Default
-- REPLICA IDENTITY only includes the primary key, which can cause filtered
-- UPDATE subscriptions to intermittently miss events.
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.table_events REPLICA IDENTITY FULL;
