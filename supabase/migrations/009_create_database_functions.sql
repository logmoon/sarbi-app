-- Helper: get current user's tenant_id (SECURITY DEFINER to bypass RLS on staff)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT tenant_id FROM public.staff WHERE auth_id = auth.uid()::text LIMIT 1;
$$;

-- Helper: get current user's location_id (SECURITY DEFINER to bypass RLS on staff)
CREATE OR REPLACE FUNCTION public.get_user_location_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT location_id FROM public.staff WHERE auth_id = auth.uid()::text LIMIT 1;
$$;

-- Trigger function: auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger to orders
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: close sessions that have exceeded their location's timeout
-- Called by API routes on session-adjacent requests (not cron)
CREATE OR REPLACE FUNCTION public.check_session_timeout()
RETURNS SETOF sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.sessions s
  SET
    status = 'closed',
    closed_at = now(),
    closed_by = 'timeout'
  FROM public.locations l
  WHERE
    s.location_id = l.id
    AND s.status = 'active'
    AND s.started_at + (l.session_timeout * interval '1 minute') < now()
  RETURNING s.*;
END;
$$;
