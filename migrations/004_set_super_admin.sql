-- Set teamz@buzztate.com as a Plus (super admin) user
-- Run this in the Supabase SQL Editor

UPDATE profiles
SET is_pro = true,
    plan_tier = 'plus',
    listings_used_this_month = 0
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'teamz@buzztate.com'
);
