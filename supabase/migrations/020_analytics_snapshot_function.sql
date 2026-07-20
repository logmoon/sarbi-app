-- ============================================================================
-- Daily snapshot function for analytics
-- ============================================================================
-- Aggregates orders + order_items for a given date and writes one
-- analytics_snapshots row per location. Called lazily by the analytics
-- API on first read of any historical day — the first request for a
-- given (date, tenant_id) generates the snapshot, subsequent requests
-- read it. No cron job required.
--
-- Today's stats are always live-computed (no snapshot needed).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_daily_snapshot(
  p_date DATE,
  p_tenant_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  loc RECORD;
  orders_today INTEGER;
  revenue_today NUMERIC(10, 3);
  top_items_json JSONB;
  peak_hours_json JSONB;
  caller_tenant UUID;
BEGIN
  -- Defence in depth: the SECURITY DEFINER bypasses RLS for the cross-table
  -- aggregation, so we re-check tenant scope from the caller's JWT. Owner
  -- / super_admin / location_manager can snapshot for their own tenant;
  -- any other role is rejected.
  caller_tenant := public.get_user_tenant_id();
  IF caller_tenant IS NULL OR caller_tenant <> p_tenant_id THEN
    RAISE EXCEPTION 'Forbidden: caller is not authorized for this tenant';
  END IF;

  -- Refuse to snapshot the current day — today's stats are always
  -- live-computed by the API. Snapshots are for closed days only.
  IF p_date = CURRENT_DATE THEN
    RETURN;
  END IF;
  FOR loc IN
    SELECT id FROM public.locations WHERE tenant_id = p_tenant_id
  LOOP
    -- Total order count for the day (any non-cancelled status).
    SELECT COUNT(*) INTO orders_today
    FROM public.orders
    WHERE tenant_id = p_tenant_id
      AND location_id = loc.id
      AND DATE(created_at AT TIME ZONE 'Africa/Tunis') = p_date
      AND status != 'cancelled';

    -- Total revenue = sum of order_items.subtotal for the day
    -- (snapshot prices — independent of any later menu edits).
    SELECT COALESCE(SUM(oi.subtotal), 0) INTO revenue_today
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.tenant_id = p_tenant_id
      AND o.location_id = loc.id
      AND DATE(o.created_at AT TIME ZONE 'Africa/Tunis') = p_date
      AND o.status != 'cancelled';

    -- Top items: aggregate by item_name, return top 5 by quantity.
    SELECT COALESCE(jsonb_agg(row), '[]'::jsonb) INTO top_items_json
    FROM (
      SELECT
        oi.item_name AS name,
        SUM(oi.quantity)::int AS count,
        SUM(oi.subtotal)::numeric(10, 3) AS revenue
      FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE o.tenant_id = p_tenant_id
        AND o.location_id = loc.id
        AND DATE(o.created_at AT TIME ZONE 'Africa/Tunis') = p_date
        AND o.status != 'cancelled'
      GROUP BY oi.item_name
      ORDER BY count DESC, revenue DESC
      LIMIT 5
    ) row;

    -- Peak hours: bucket orders by hour (Africa/Tunis) for the day.
    SELECT COALESCE(jsonb_agg(row), '[]'::jsonb) INTO peak_hours_json
    FROM (
      SELECT
        EXTRACT(HOUR FROM o.created_at AT TIME ZONE 'Africa/Tunis')::int AS hour,
        COUNT(*)::int AS count
      FROM public.orders o
      WHERE o.tenant_id = p_tenant_id
        AND o.location_id = loc.id
        AND DATE(o.created_at AT TIME ZONE 'Africa/Tunis') = p_date
        AND o.status != 'cancelled'
      GROUP BY 1
      ORDER BY 1
    ) row;

    INSERT INTO public.analytics_snapshots (
      tenant_id,
      location_id,
      snapshot_date,
      total_orders,
      total_revenue,
      top_items,
      peak_hours,
      created_at
    ) VALUES (
      p_tenant_id,
      loc.id,
      p_date,
      orders_today,
      revenue_today,
      top_items_json,
      peak_hours_json,
      now()
    )
    ON CONFLICT (location_id, snapshot_date) DO UPDATE
      SET total_orders = EXCLUDED.total_orders,
          total_revenue = EXCLUDED.total_revenue,
          top_items = EXCLUDED.top_items,
          peak_hours = EXCLUDED.peak_hours,
          created_at = now();
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_daily_snapshot(DATE, UUID) TO authenticated;
