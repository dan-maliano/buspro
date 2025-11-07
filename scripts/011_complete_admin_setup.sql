-- סקריפט מאוחד להגדרת פאנל אדמין
-- הרץ סקריפט זה ב-Supabase SQL Editor

-- שלב 1: מלא את טבלת profiles ממשתמשים קיימים
INSERT INTO profiles (id, email, full_name, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- שלב 2: הסר policies ישנים שעלולים להפריע
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "admin_all_access" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

-- שלב 3: צור policy חדש שמאפשר לאדמין לראות הכל
CREATE POLICY "admin_full_select_access" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'dbm1000000@gmail.com'
    OR id = auth.uid()
  );

-- שלב 4: וודא שכל המשתמשים נוצרו בטבלה
DO $$
DECLARE
  users_count INT;
  profiles_count INT;
BEGIN
  SELECT COUNT(*) INTO users_count FROM auth.users;
  SELECT COUNT(*) INTO profiles_count FROM profiles;
  
  RAISE NOTICE 'משתמשים ב-auth.users: %', users_count;
  RAISE NOTICE 'פרופילים ב-profiles: %', profiles_count;
  
  IF users_count = profiles_count THEN
    RAISE NOTICE '✓ כל המשתמשים קיימים בטבלת profiles';
  ELSE
    RAISE WARNING '⚠ חסרים % פרופילים', users_count - profiles_count;
  END IF;
END $$;

-- שלב 5: הצג את כל ה-policies הפעילים
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
