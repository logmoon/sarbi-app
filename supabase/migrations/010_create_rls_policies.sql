-- ============================================================================
-- RLS Policies — all 12 tables
-- ============================================================================
-- Roles: super_admin, owner, location_manager, kitchen, floor
-- Helpers: auth.jwt() ->> 'user_role', public.get_user_tenant_id(), public.get_user_location_id()
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TENANTS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON tenants
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_select" ON tenants
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND id = public.get_user_tenant_id()
  );

CREATE POLICY "owner_update" ON tenants
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND id = public.get_user_tenant_id()
  ) WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_select" ON tenants
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND id = public.get_user_tenant_id()
  );

-- anon: allow reading tenant by slug (customer menu lookup)
CREATE POLICY "anon_select" ON tenants
  FOR SELECT USING (auth.role() = 'anon');

-- ---------------------------------------------------------------------------
-- LOCATIONS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON locations
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON locations
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_all" ON locations
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND id = public.get_user_location_id()
  );

CREATE POLICY "kitchen_select" ON locations
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'kitchen'
    AND id = public.get_user_location_id()
  );

CREATE POLICY "floor_select" ON locations
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND id = public.get_user_location_id()
  );

-- ---------------------------------------------------------------------------
-- STAFF
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON staff
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON staff
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_select" ON staff
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "location_manager_insert" ON staff
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "staff_select_self" ON staff
  FOR SELECT USING (
    auth.uid()::text = auth_id
  );

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON categories
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON categories
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_select" ON categories
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND tenant_id = public.get_user_tenant_id()
  );

-- anon: see available categories
CREATE POLICY "anon_select" ON categories
  FOR SELECT USING (
    auth.role() = 'anon'
    AND is_available = true
  );

-- ---------------------------------------------------------------------------
-- ITEMS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON items
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON items
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_select" ON items
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND tenant_id = public.get_user_tenant_id()
  );

-- anon: see available items
CREATE POLICY "anon_select" ON items
  FOR SELECT USING (
    auth.role() = 'anon'
    AND is_available = true
  );

-- ---------------------------------------------------------------------------
-- LOCATION ITEM OVERRIDES
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON location_item_overrides
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON location_item_overrides
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND location_id IN (
      SELECT id FROM public.locations WHERE tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "location_manager_all" ON location_item_overrides
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON tables
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON tables
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_all" ON tables
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "kitchen_select" ON tables
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'kitchen'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "floor_select" ON tables
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  );

-- anon: resolve public_code to table data
CREATE POLICY "anon_select" ON tables
  FOR SELECT USING (auth.role() = 'anon');

-- ---------------------------------------------------------------------------
-- SESSIONS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON sessions
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON sessions
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_all" ON sessions
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "kitchen_select" ON sessions
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'kitchen'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "floor_select" ON sessions
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  );

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON orders
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON orders
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_all" ON orders
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "kitchen_select" ON orders
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'kitchen'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "kitchen_update" ON orders
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_role') = 'kitchen'
    AND location_id = public.get_user_location_id()
  ) WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'kitchen'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "floor_select" ON orders
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  );

-- ---------------------------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON order_items
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON order_items
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND order_id IN (
      SELECT id FROM public.orders WHERE tenant_id = public.get_user_tenant_id()
    )
  );

CREATE POLICY "location_manager_all" ON order_items
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND order_id IN (
      SELECT id FROM public.orders WHERE location_id = public.get_user_location_id()
    )
  );

CREATE POLICY "kitchen_select" ON order_items
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'kitchen'
    AND order_id IN (
      SELECT id FROM public.orders WHERE location_id = public.get_user_location_id()
    )
  );

CREATE POLICY "floor_select" ON order_items
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND order_id IN (
      SELECT id FROM public.orders WHERE location_id = public.get_user_location_id()
    )
  );

-- ---------------------------------------------------------------------------
-- TABLE EVENTS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON table_events
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON table_events
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_all" ON table_events
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "floor_select" ON table_events
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  );

CREATE POLICY "floor_update" ON table_events
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  ) WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'floor'
    AND location_id = public.get_user_location_id()
  );

-- ---------------------------------------------------------------------------
-- ANALYTICS SNAPSHOTS
-- ---------------------------------------------------------------------------
CREATE POLICY "super_admin_all" ON analytics_snapshots
  FOR ALL USING ((auth.jwt() ->> 'user_role') = 'super_admin');

CREATE POLICY "owner_all" ON analytics_snapshots
  FOR ALL USING (
    (auth.jwt() ->> 'user_role') = 'owner'
    AND tenant_id = public.get_user_tenant_id()
  );

CREATE POLICY "location_manager_select" ON analytics_snapshots
  FOR SELECT USING (
    (auth.jwt() ->> 'user_role') = 'location_manager'
    AND location_id = public.get_user_location_id()
  );
