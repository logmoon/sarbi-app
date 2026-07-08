-- Seed: dev tenant + owner account
-- Note: auth_id is left NULL — run the invite flow to create the auth user

INSERT INTO tenants (id, name, slug, plan)
VALUES (
  'daf561f8-56be-4155-93d8-33c0b9181a32',
  'Café El Manar',
  'cafe-el-manar',
  'pro'
);

INSERT INTO locations (id, tenant_id, name, address)
VALUES (
  '11e029ca-d8bf-4817-adae-6af9e757c720',
  'daf561f8-56be-4155-93d8-33c0b9181a32',
  'Café El Manar — Centre Ville',
  '15 Avenue Habib Bourguiba, Tunis'
);

INSERT INTO staff (id, tenant_id, location_id, email, name, role)
VALUES (
  '270510e6-4ad5-49d2-96af-1a1d50389b91',
  'daf561f8-56be-4155-93d8-33c0b9181a32',
  '11e029ca-d8bf-4817-adae-6af9e757c720',
  'owner@cafe-el-manar.tn',
  'Ahmed Ben Ali',
  'owner'
);
