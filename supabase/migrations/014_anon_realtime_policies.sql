-- Allow anon users to SELECT active sessions (needed for Realtime subscriptions)
CREATE POLICY "anon_select_active" ON sessions
  FOR SELECT USING (
    auth.role() = 'anon' AND status = 'active'
  );

-- Allow anon users to SELECT orders belonging to an active session
CREATE POLICY "anon_select_orders" ON orders
  FOR SELECT USING (
    auth.role() = 'anon'
    AND EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = orders.session_id
      AND sessions.status = 'active'
    )
  );

-- Allow anon users to SELECT order_items through an active session's orders
CREATE POLICY "anon_select_order_items" ON order_items
  FOR SELECT USING (
    auth.role() = 'anon'
    AND EXISTS (
      SELECT 1 FROM orders
      JOIN sessions ON sessions.id = orders.session_id
      WHERE orders.id = order_items.order_id
      AND sessions.status = 'active'
    )
  );

-- Allow anon users to SELECT table_events belonging to an active session
CREATE POLICY "anon_select_table_events" ON table_events
  FOR SELECT USING (
    auth.role() = 'anon'
    AND EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = table_events.session_id
      AND sessions.status = 'active'
    )
  );
