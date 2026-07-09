-- Helper: get active session for a table
CREATE OR REPLACE FUNCTION public.get_active_session(p_table_id UUID)
RETURNS SETOF sessions
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.sessions
  WHERE table_id = p_table_id
    AND status = 'active'
  LIMIT 1;
$$;

-- Helper: get location timeout setting
CREATE OR REPLACE FUNCTION public.get_location_timeout(p_location_id UUID)
RETURNS INTEGER
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT session_timeout FROM public.locations WHERE id = p_location_id;
$$;
