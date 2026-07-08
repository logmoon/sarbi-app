CREATE TABLE location_item_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  price DECIMAL(10,3),
  is_available BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(location_id, item_id)
);

ALTER TABLE location_item_overrides ENABLE ROW LEVEL SECURITY;

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  public_code TEXT UNIQUE NOT NULL CHECK (char_length(public_code) = 8),
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tables_tenant_id ON tables(tenant_id);
CREATE INDEX idx_tables_location_id ON tables(location_id);
CREATE INDEX idx_tables_public_code ON tables(public_code);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
