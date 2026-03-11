-- Set teamz@buzztate.com as a Plus (super admin) user
-- Run this in the Supabase SQL Editor
--
-- If migrations 002/003 have NOT been run yet (plan_tier column missing),
-- use this simpler version that only sets is_pro:

UPDATE profiles
SET is_pro = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'teamz@buzztate.com'
);

-- If migrations 002/003 HAVE been run (plan_tier column exists),
-- uncomment and run this instead:
--
-- UPDATE profiles
-- SET is_pro = true, plan_tier = 'plus', listings_used_this_month = 0
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'teamz@buzztate.com'
-- );
