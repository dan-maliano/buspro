-- Allow admin to view all profiles
CREATE POLICY "admin_select_all_profiles" ON public.profiles
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'dbm1000000@gmail.com'
  );

-- Also allow admin to delete users
CREATE POLICY "admin_delete_profiles" ON public.profiles
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'dbm1000000@gmail.com'
  );
