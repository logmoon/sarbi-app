"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
import { formatItemPrice } from "@/lib/utils";

type Range = "7d" | "30d" | "90d";

type TodayStats = {
  order_count: number;
  revenue: number;
  items_sold: number;
  avg_order_value: number;
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

type AnalyticsData = {
  today: TodayStats;
  range: { days: number; series: DailyPoint[] };
  top_items: TopItem[];
  peak_hours: PeakHour[];
};

type AnalyticsDashboardProps = {
  // Forwarded from the server page. The cookie session already scopes the
  // API call to the caller's tenant, so the prop is currently unused in
  // the request itself — but it makes the data flow explicit and keeps
  // the component reusable (e.g. for a super admin view that needs to
  // pass a different tenant).
  tenantId: string;
};

const RANGES: Array<{ value: Range; labelKey: string }> = [
  { value: "7d", labelKey: "analytics.range7d" },
  { value: "30d", labelKey: "analytics.range30d" },
  { value: "90d", labelKey: "analytics.range90d" },
];

export function AnalyticsDashboard(props: AnalyticsDashboardProps) {
  // The tenantId prop is forwarded for future use (super admin view, etc.)
  // — the cookie session already scopes the request to the caller's tenant.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tenantId: _tenantId } = props;
  const { locale } = useLanguage();
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (!res.ok) {
        const err: { error?: string } = await res.json();
        throw new Error(err.error ?? "Failed to load analytics");
      }
      const json: { data: AnalyticsData } = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, "analytics.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [range, locale]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t(locale, "analytics.title")}
          </h1>
          <p className="text-sm text-text-secondary">
            {t(locale, "analytics.subtitle")}
          </p>
        </div>
        <div className="flex gap-1 rounded-sm border border-border bg-surface p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={
                "rounded-sm px-3 py-1.5 text-xs font-medium transition-colors " +
                (range === r.value
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-background hover:text-text-primary")
              }
            >
              {t(locale, r.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-sm border border-status-error bg-status-error/10 p-3 text-sm text-status-error">
          {error}
        </div>
      )}

      {!data ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-text-muted">{t(locale, "analytics.loading")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label={t(locale, "analytics.ordersToday")}
              value={String(data.today.order_count)}
              loading={loading}
            />
            <StatCard
              label={t(locale, "analytics.revenueToday")}
              value={formatItemPrice(data.today.revenue, locale)}
              loading={loading}
            />
            <StatCard
              label={t(locale, "analytics.avgOrderValue")}
              value={formatItemPrice(data.today.avg_order_value, locale)}
              loading={loading}
            />
            <StatCard
              label={t(locale, "analytics.itemsSold")}
              value={String(data.today.items_sold)}
              loading={loading}
            />
          </div>

          {/* Orders over time chart */}
          <Card>
            <CardHeader className="mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {t(locale, "analytics.ordersOverTime")}
              </h2>
            </CardHeader>
            <CardContent>
              <OrdersChart series={data.range.series} locale={locale} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top items */}
            <Card>
              <CardHeader className="mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t(locale, "analytics.topItems")}
                </h2>
              </CardHeader>
              <CardContent>
                {data.top_items.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    {t(locale, "analytics.noData")}
                  </p>
                ) : (
                  <ol className="space-y-2">
                    {data.top_items.map((item, idx) => (
                      <li
                        key={item.name}
                        className="flex items-baseline justify-between gap-2"
                      >
                        <span className="flex min-w-0 items-baseline gap-2 text-sm text-text-primary">
                          <span className="w-5 shrink-0 text-xs font-semibold text-text-muted">
                            {idx + 1}.
                          </span>
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="shrink-0 text-xs text-text-secondary">
                          {t(locale, "analytics.soldCount", {
                            count: item.count,
                          })}{" "}
                          · {formatItemPrice(item.revenue, locale)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Peak hours heatmap */}
            <Card>
              <CardHeader className="mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t(locale, "analytics.peakHours")}
                </h2>
              </CardHeader>
              <CardContent>
                <PeakHoursChart hours={data.peak_hours} locale={locale} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-text-primary">
          {loading ? "—" : value}
        </p>
      </CardContent>
    </Card>
  );
}

function OrdersChart({ series, locale }: { series: DailyPoint[]; locale: ReturnType<typeof useLanguage>["locale"] }) {
  const formatted = series.map((p) => ({
    ...p,
    label: formatChartLabel(p.date, locale),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-text-secondary)" }}
          />
          <Line
            type="monotone"
            dataKey="order_count"
            name={t(locale, "analytics.ordersCount")}
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatHourLabel(hour: number, locale: ReturnType<typeof useLanguage>["locale"]): string {
  if (locale === "en") {
    const period = hour < 12 ? "AM" : "PM";
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12} ${period}`;
  }
  // ar/fr both conventionally use 24h clock in this market.
  return `${hour}h`;
}

function PeakHoursChart({
  hours,
  locale,
}: {
  hours: PeakHour[];
  locale: ReturnType<typeof useLanguage>["locale"];
}) {
  const byHour = new Map(hours.map((h) => [h.hour, h.count]));
  const data = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: formatHourLabel(hour, locale),
    count: byHour.get(hour) ?? 0,
  }));

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const peak = data.reduce((best, d) => (d.count > best.count ? d : best), data[0]);
  const tickHours = [0, 3, 6, 9, 12, 15, 18, 21];

  if (total === 0) {
    return (
      <p className="text-sm text-text-muted">{t(locale, "analytics.noData")}</p>
    );
  }

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              ticks={tickHours.map((h) => formatHourLabel(h, locale))}
              interval={0}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={12}
              tickLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--color-text-secondary)" }}
              formatter={(value) => [
                t(locale, "analytics.soldCount", { count: Number(value ?? 0) }),
                "",
              ]}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.hour}
                  fill={
                    d.hour === peak.hour
                      ? "var(--color-accent)"
                      : "rgba(245, 158, 11, 0.35)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {peak.count > 0 && (
        <p className="mt-2 text-center text-xs text-text-secondary">
          {t(locale, "analytics.peakHourSummary", {
            label: peak.label,
            count: peak.count,
          })}
        </p>
      )}
    </div>
  );
}

function formatChartLabel(date: string, locale: ReturnType<typeof useLanguage>["locale"]): string {
  const d = new Date(date);
  if (locale === "ar") {
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  }
  if (locale === "fr") {
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  }
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}
