-- Simplify pricing tiers: free + plus only (remove starter, growth, scale)

-- 1. Migrate existing paid users to 'plus' tier
UPDATE profiles SET plan_tier = 'plus' WHERE plan_tier IN ('starter', 'growth', 'scale');

-- 2. Update the CHECK constraint to only allow free/plus
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_tier_check CHECK (plan_tier IN ('free', 'plus'));

-- 3. Update column comment
COMMENT ON COLUMN profiles.plan_tier IS 'Subscription tier: free or plus';
