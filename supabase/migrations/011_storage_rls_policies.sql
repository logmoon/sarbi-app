-- Storage RLS policies for menu-images bucket
-- Allows authenticated users (owner, location_manager) to upload and manage images
-- Allows anon users to read images (for customer menu display)

CREATE POLICY "authenticated_insert_menu_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "authenticated_select_menu_images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'menu-images');

CREATE POLICY "authenticated_update_menu_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'menu-images');

CREATE POLICY "authenticated_delete_menu_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'menu-images');

CREATE POLICY "anon_select_menu_images" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'menu-images');
