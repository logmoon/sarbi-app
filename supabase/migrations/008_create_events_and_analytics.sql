CREATE TYPE event_type AS ENUM ('waiter_called', 'bill_requested', 'check_needed');
CREATE TYPE event_status AS ENUM ('pending', 'resolved');

CREATE TABLE table_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  status event_status NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_table_events_tenant_id ON table_events(tenant_id);
CREATE INDEX idx_table_events_location_id ON table_events(location_id);
CREATE INDEX idx_table_events_status ON table_events(status);

ALTER TABLE table_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(10,3) NOT NULL DEFAULT 0,
  top_items JSONB DEFAULT '[]'::jsonb,
  peak_hours JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(location_id, snapshot_date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
