CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_id text;
BEGIN
  user_id := event ->> 'user_id';

  SELECT role::text INTO user_role
  FROM public.staff
  WHERE auth_id = user_id;

  claims := event -> 'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', 'null');
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Grant permissions for the hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public roles (hook is auth-internal only)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- Allow supabase_auth_admin to query the staff table
GRANT SELECT ON TABLE public.staff TO supabase_auth_admin;
CREATE POLICY "supabase_auth_admin can read staff" ON public.staff
  FOR SELECT TO supabase_auth_admin USING (true);
