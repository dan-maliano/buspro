-- Allow admin user to view all profiles
-- Creating RLS policy that allows the admin to see all user profiles

-- Drop policy if exists
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;

-- Create policy for admin to select all profiles
CREATE POLICY profiles_select_admin
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Allow if user is the admin
  auth.jwt() ->> 'email' = 'dbm1000000@gmail.com'
);

-- Also ensure existing policy doesn't conflict
-- The existing profiles_select_own should allow users to see their own profile
-- And the new profiles_select_admin allows admin to see all profiles
