-- ============================================================================
-- Floor staff UPDATE policy on orders — allows floor staff to mark orders as
-- delivered (ready → delivered transition). Floor SELECT already exists in
-- migration 010. Kitchen UPDATE was already there — this mirrors it for floor.
-- ============================================================================

CREATE POLICY "floor_update" ON orders
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  ) WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  );
