-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-document', 'application-document', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow Public Read Access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'application-document');

-- 3. Allow Authenticated Uploads (Admin and Operator)
DROP POLICY IF EXISTS "Allow Admins and Operators to Upload" ON storage.objects;
CREATE POLICY "Allow Admins and Operators to Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'application-document' AND
  (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.operators
      WHERE id = auth.uid() AND is_active = true
    )
  )
);

-- 4. Allow Admin/Operator to Delete/Update their own uploads if needed
DROP POLICY IF EXISTS "Allow Admins and Operators to Manage" ON storage.objects;
CREATE POLICY "Allow Admins and Operators to Manage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'application-document' AND
  (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.operators
      WHERE id = auth.uid() AND is_active = true
    )
  )
);
