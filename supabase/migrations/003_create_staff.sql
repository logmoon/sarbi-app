CREATE TYPE staff_role AS ENUM ('owner', 'location_manager', 'kitchen', 'floor', 'super_admin');

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role staff_role NOT NULL,
  auth_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT staff_location_required CHECK (role NOT IN ('kitchen', 'floor') OR location_id IS NOT NULL)
);

CREATE INDEX idx_staff_tenant_id ON staff(tenant_id);
CREATE INDEX idx_staff_location_id ON staff(location_id);
CREATE INDEX idx_staff_auth_id ON staff(auth_id);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
