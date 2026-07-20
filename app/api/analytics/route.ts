import { NextResponse, type NextRequest } from "next/server";
import { getStaffTenantAndLocation } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

type DailyPoint = {
  date: string;
  order_count: number;
  revenue: number;
};

type TopItem = {
  name: string;
  count: number;
  revenue: number;
};

type PeakHour = {
  hour: number;
  count: number;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

export async function GET(request: NextRequest) {
  const { tenantId, locationId, error } = await getStaffTenantAndLocation();
  if (error) return error;

  const range = request.nextUrl.searchParams.get("range") ?? "7d";
  const days = RANGE_DAYS[range];

  if (!days) {
    return NextResponse.json(
      { error: "Invalid range. Use 7d, 30d, or 90d.", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // --- Live "today" stats: always computed from raw orders, never
  //     snapshotted. Today rolls forward in real time.
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

  let todayQuery = admin
    .from("orders")
    .select("id, location_id, order_items(subtotal, quantity)")
    .eq("tenant_id", tenantId)
    .neq("status", "cancelled")
    .gte("created_at", todayStart.toISOString())
    .lt("created_at", tomorrowStart.toISOString());

  if (locationId !== null) {
    todayQuery = todayQuery.eq("location_id", locationId);
  }

  const { data: todayOrders, error: todayErr } = await todayQuery;

  if (todayErr) {
    return NextResponse.json(
      { error: "Failed to fetch today's orders", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  let todayOrderCount = 0;
  let todayRevenue = 0;
  let todayItemsSold = 0;
  for (const order of todayOrders ?? []) {
    todayOrderCount += 1;
    for (const oi of order.order_items ?? []) {
      todayRevenue += Number(oi.subtotal ?? 0);
      todayItemsSold += Number(oi.quantity ?? 0);
    }
  }

  // --- Lazy snapshot generation for the historical range (yesterday and
  //     earlier). Today is excluded by the function itself. We fire these
  //     sequentially so the admin client doesn't deadlock.
  for (let i = 1; i <= days; i++) {
    const date = isoDate(daysAgo(i));
    const { error: snapErr } = await admin.rpc("generate_daily_snapshot", {
      p_date: date,
      p_tenant_id: tenantId,
    });
    if (snapErr) {
      // Log but don't fail the whole response — partial data is more
      // useful than nothing.
      console.error(
        `[analytics] snapshot failed for ${date}:`,
        snapErr.message
      );
    }
  }

  // --- Read snapshots for the range.
  const rangeStart = isoDate(daysAgo(days));
  let snapshotsQuery = admin
    .from("analytics_snapshots")
    .select("snapshot_date, total_orders, total_revenue")
    .eq("tenant_id", tenantId)
    .gte("snapshot_date", rangeStart)
    .order("snapshot_date", { ascending: true });

  if (locationId !== null) {
    snapshotsQuery = snapshotsQuery.eq("location_id", locationId);
  }

  const { data: snapshots, error: snapReadErr } = await snapshotsQuery;

  if (snapReadErr) {
    return NextResponse.json(
      { error: "Failed to read snapshots", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  // Group snapshots by date (sum across locations if the tenant has more
  // than one). Today's slot in the chart is filled with the live-computed
  // values for continuity.
  const byDate = new Map<string, DailyPoint>();
  for (const row of snapshots ?? []) {
    const date = row.snapshot_date as string;
    const existing = byDate.get(date) ?? {
      date,
      order_count: 0,
      revenue: 0,
    };
    existing.order_count += row.total_orders ?? 0;
    existing.revenue += Number(row.total_revenue ?? 0);
    byDate.set(date, existing);
  }

  // Fill in the requested range with zero-days so the chart has a
  // continuous x-axis even when the tenant is brand new.
  const rangeSeries: DailyPoint[] = [];
  for (let i = days; i >= 0; i--) {
    const date = isoDate(daysAgo(i));
    if (i === 0) {
      rangeSeries.push({
        date,
        order_count: todayOrderCount,
        revenue: todayRevenue,
      });
    } else {
      rangeSeries.push(
        byDate.get(date) ?? { date, order_count: 0, revenue: 0 }
      );
    }
  }

  // --- Top items + peak hours: compute live from raw orders for the full
  //     range. Snapshot top_items only stores the per-day top 5, which is
  //     too lossy to union across 90 days. Live compute is fast for the
  //     order volumes this product expects (50-200 orders/day per tenant).
  const rangeStartIso = new Date(rangeStart);
  rangeStartIso.setUTCHours(0, 0, 0, 0);

  // order_items has a single FK to orders (order_id), so the join name is
  // the table name itself. We can't filter on a joined column via the
  // PostgREST syntax in the same call as the join without using `!inner`
  // or filters, so we fetch the joined rows and filter tenant/location
  // client-side. RLS already restricts the caller's visibility, so
  // filtering is for cross-tenant data hygiene.
  const { data: items, error: topErr } = await admin
    .from("order_items")
    .select("item_name, quantity, subtotal, orders(tenant_id, status, location_id, created_at)")
    .gte("orders.created_at", rangeStartIso.toISOString());

  if (topErr) {
    return NextResponse.json(
      { error: "Failed to fetch top items", code: "DB_ERROR" },
      { status: 500 }
    );
  }

  const topMap = new Map<string, TopItem>();
  const hourMap = new Map<number, number>();

  for (const oi of items ?? []) {
    const order = (oi as { orders?: { tenant_id?: string; status?: string; location_id?: string; created_at?: string } | null })
      .orders;
    if (!order || order.tenant_id !== tenantId) continue;
    if (locationId !== null && order.location_id !== locationId) continue;
    if (order.status === "cancelled") continue;

    const name = (oi as { item_name: string }).item_name;
    const qty = Number((oi as { quantity: number }).quantity ?? 0);
    const sub = Number((oi as { subtotal: number }).subtotal ?? 0);

    const existing = topMap.get(name) ?? { name, count: 0, revenue: 0 };
    existing.count += qty;
    existing.revenue += sub;
    topMap.set(name, existing);

    if (order.created_at) {
      const hour = new Date(order.created_at).getUTCHours();
      hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
    }
  }

  const topItems: TopItem[] = Array.from(topMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const peakHours: PeakHour[] = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);

  return NextResponse.json({
    data: {
      today: {
        order_count: todayOrderCount,
        revenue: todayRevenue,
        items_sold: todayItemsSold,
        avg_order_value: todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0,
      },
      range: {
        days,
        series: rangeSeries,
      },
      top_items: topItems,
      peak_hours: peakHours,
    },
  });
}
