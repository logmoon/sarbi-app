-- ============================================================================
-- Enforce a single active session per table at the database level
-- ============================================================================
-- Previously nothing stopped two concurrent "create session" requests (e.g.
-- two people at the same table scanning the QR within milliseconds of each
-- other) from both passing the "no active session exists" check and both
-- inserting a row, splitting orders/bill totals across two sessions for one
-- physical table. This partial unique index makes that impossible; the API
-- layer catches the resulting conflict and returns the winning session
-- instead of erroring (see app/api/sessions/route.ts).
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_one_active_per_table
  ON public.sessions (table_id)
  WHERE status = 'active';
