-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_all_users_admin();

-- Create a function that returns all users (bypasses RLS)
-- This function runs with SECURITY DEFINER which means it runs with the permissions of the function creator
CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is the admin
  IF auth.email() = 'dbm1000000@gmail.com' THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.email,
      p.full_name,
      p.created_at,
      p.updated_at
    FROM profiles p
    ORDER BY p.created_at DESC;
  ELSE
    -- If not admin, return empty set
    RETURN;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_admin() TO authenticated;

-- Verify the function was created
SELECT 'Function created successfully!' as status;
