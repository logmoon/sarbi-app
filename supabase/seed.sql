-- Seed: dev tenant + owner account + sample data
-- Note: staff.auth_id is left NULL — run the invite flow to create the auth user

-- Tenant
INSERT INTO tenants (id, name, slug, plan)
VALUES (
  'daf561f8-56be-4155-93d8-33c0b9181a32',
  'Café El Manar',
  'cafe-el-manar',
  'pro'
);

-- Location
INSERT INTO locations (id, tenant_id, name, address)
VALUES (
  '11e029ca-d8bf-4817-adae-6af9e757c720',
  'daf561f8-56be-4155-93d8-33c0b9181a32',
  'Café El Manar — Centre Ville',
  '15 Avenue Habib Bourguiba, Tunis'
);

-- Owner staff
INSERT INTO staff (id, tenant_id, location_id, email, name, role)
VALUES (
  '270510e6-4ad5-49d2-96af-1a1d50389b91',
  'daf561f8-56be-4155-93d8-33c0b9181a32',
  '11e029ca-d8bf-4817-adae-6af9e757c720',
  'owner@cafe-el-manar.tn',
  'Ahmed Ben Ali',
  'owner'
);

-- Categories
INSERT INTO categories (id, tenant_id, name, sort_order)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    '{"ar": "قهوة", "fr": "Café Chaud", "en": "Hot Coffee"}',
    1
  ),
  (
    'a1b2c3d4-0001-4000-8000-000000000002',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    '{"ar": "حلويات", "fr": "Pâtisseries", "en": "Pastries"}',
    2
  ),
  (
    'a1b2c3d4-0001-4000-8000-000000000003',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    '{"ar": "عصائر", "fr": "Jus Frais", "en": "Fresh Juice"}',
    3
  );

-- Items
INSERT INTO items (id, tenant_id, category_id, name, description, price, sort_order)
VALUES
  (
    'b2c3d4e5-0001-4000-8000-000000000001',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    'a1b2c3d4-0001-4000-8000-000000000001',
    '{"ar": "اسبريسو", "fr": "Espresso", "en": "Espresso"}',
    '{"ar": "قهوة اسبريسو مركزة", "fr": "Café espresso serré", "en": "Strong espresso coffee"}',
    2.500,
    1
  ),
  (
    'b2c3d4e5-0001-4000-8000-000000000002',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    'a1b2c3d4-0001-4000-8000-000000000001',
    '{"ar": "كابتشينو", "fr": "Cappuccino", "en": "Cappuccino"}',
    '{"ar": "اسبريسو مع حليب رغوي", "fr": "Espresso avec lait mousseux", "en": "Espresso with foamed milk"}',
    4.000,
    2
  ),
  (
    'b2c3d4e5-0001-4000-8000-000000000003',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    'a1b2c3d4-0001-4000-8000-000000000002',
    '{"ar": "كرواسون", "fr": "Croissant", "en": "Croissant"}',
    '{"ar": "كرواسون بالزبدة", "fr": "Croissant au beurre", "en": "Butter croissant"}',
    3.000,
    1
  ),
  (
    'b2c3d4e5-0001-4000-8000-000000000004',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    'a1b2c3d4-0001-4000-8000-000000000002',
    '{"ar": "مقروض", "fr": "Makroud", "en": "Makroud"}',
    '{"ar": "مقروض بالتمر", "fr": "Pâtisserie tunisienne aux dattes", "en": "Tunisian semolina pastry with dates"}',
    2.500,
    2
  ),
  (
    'b2c3d4e5-0001-4000-8000-000000000005',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    'a1b2c3d4-0001-4000-8000-000000000003',
    '{"ar": "عصير برتقال", "fr": "Jus d''orange", "en": "Orange Juice"}',
    '{"ar": "عصير برتقال طازج", "fr": "Jus d''orange frais", "en": "Fresh orange juice"}',
    5.000,
    1
  ),
  (
    'b2c3d4e5-0001-4000-8000-000000000006',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    'a1b2c3d4-0001-4000-8000-000000000003',
    '{"ar": "عصير ليمون", "fr": "Jus de citron", "en": "Lemon Juice"}',
    '{"ar": "عصير ليمون طازج مع نعناع", "fr": "Jus de citron frais à la menthe", "en": "Fresh lemon juice with mint"}',
    4.500,
    2
  );

-- Tables
INSERT INTO tables (id, tenant_id, location_id, label, public_code, qr_code_url, is_active)
VALUES
  (
    'c3d4e5f6-0001-4000-8000-000000000001',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    '11e029ca-d8bf-4817-adae-6af9e757c720',
    'Table 1',
    'a1b2c3d4',
    'http://localhost:3000/cafe-el-manar/table/a1b2c3d4',
    true
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000002',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    '11e029ca-d8bf-4817-adae-6af9e757c720',
    'Table 2',
    'e5f6g7h8',
    'http://localhost:3000/cafe-el-manar/table/e5f6g7h8',
    true
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000003',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    '11e029ca-d8bf-4817-adae-6af9e757c720',
    'Terrasse 1',
    'i9j0k1l2',
    'http://localhost:3000/cafe-el-manar/table/i9j0k1l2',
    true
  ),
  (
    'c3d4e5f6-0001-4000-8000-000000000004',
    'daf561f8-56be-4155-93d8-33c0b9181a32',
    '11e029ca-d8bf-4817-adae-6af9e757c720',
    'Terrasse 2',
    'm3n4o5p6',
    'http://localhost:3000/cafe-el-manar/table/m3n4o5p6',
    false
  );
