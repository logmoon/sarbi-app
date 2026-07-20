-- ============================================================================
-- Add is_active to staff + wire into access token hook
-- ============================================================================
-- Owners can deactivate a staff account without losing the historical
-- record (preserves order attribution, etc). The custom_access_token_hook
-- refuses to issue a role claim for inactive staff, which forces the
-- dashboard middleware to redirect them to /login on every request.

ALTER TABLE staff
  ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX idx_staff_is_active ON staff(is_active) WHERE is_active = true;

-- Recreate the hook so it filters inactive staff out of role lookup.
-- An inactive staff member keeps their auth_id, but sign-in yields a
-- JWT with user_role = 'null' (matching the existing "no staff row"
-- branch), which the dashboard layout treats as no access.
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
  WHERE auth_id = user_id
    AND is_active = true;

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
