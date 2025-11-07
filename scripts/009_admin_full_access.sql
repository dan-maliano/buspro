-- Creating a robust RLS policy for admin access
-- Drop existing admin policy if exists
DROP POLICY IF EXISTS profiles_select_admin ON profiles;
DROP POLICY IF EXISTS admin_all_access ON profiles;

-- Create new policy that allows admin to SELECT all profiles
CREATE POLICY admin_all_access ON profiles
  FOR SELECT
  USING (
    -- Allow admin user to see all profiles
    auth.jwt() ->> 'email' = 'dbm1000000@gmail.com'
    OR
    -- Or allow users to see their own profile
    auth.uid() = id
  );

-- Verify the policy was created
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'profiles';
