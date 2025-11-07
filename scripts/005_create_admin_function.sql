-- Create a function that allows admin to view all users
-- This function runs with SECURITY DEFINER which means it runs with the privileges of the function owner
CREATE OR REPLACE FUNCTION get_all_users_for_admin(admin_user_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  admin_email text;
BEGIN
  -- Check if the requesting user is the admin
  SELECT auth.email() INTO admin_email;
  
  IF admin_email != 'dbm1000000@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Return all users from profiles
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.email, '') as email,
    COALESCE(p.full_name, 'לא צוין') as full_name,
    p.created_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_for_admin(uuid) TO authenticated;
