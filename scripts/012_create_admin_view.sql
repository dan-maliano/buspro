-- יצירת View שמאפשר לאדמין לראות את כל המשתמשים
-- View זה עוקף את RLS ומאפשר גישה למשתמשי auth

-- קודם, צור פונקציה שבודקת אם המשתמש הוא אדמין
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT auth.jwt() ->> 'email' = 'dbm1000000@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- צור view שמשלב נתונים מ-auth.users ו-profiles
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email) as full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE public.is_admin();

-- תן הרשאות ל-view
GRANT SELECT ON public.admin_users_view TO authenticated;

-- הצג הודעת הצלחה
DO $$
BEGIN
  RAISE NOTICE '✓ Admin view created successfully!';
  RAISE NOTICE 'המשתמשים זמינים כעת ב-view: admin_users_view';
END $$;
