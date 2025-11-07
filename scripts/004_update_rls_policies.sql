-- Update RLS policies to allow admin to view all profiles
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    auth.email() = 'dbm1000000@gmail.com'
  );

-- Add policy for admin to delete users
CREATE POLICY profiles_delete_admin ON profiles
  FOR DELETE
  USING (auth.email() = 'dbm1000000@gmail.com');
