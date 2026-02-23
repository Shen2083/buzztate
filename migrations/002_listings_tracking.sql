-- Listings Tracking & Tier System for E-Commerce Listing Localizer
-- Adds plan tiers, usage tracking, and localization job history.

-- 1. Add tier and usage columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (plan_tier IN ('free', 'starter', 'growth', 'scale')),
  ADD COLUMN IF NOT EXISTS listings_used_this_month INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS listings_reset_date TIMESTAMPTZ DEFAULT NOW();

-- 2. Backfill: existing Pro users become 'starter' tier
UPDATE profiles SET plan_tier = 'starter' WHERE is_pro = true AND plan_tier = 'free';

-- 3. Localization jobs table (one row per CSV upload / localize request)
CREATE TABLE IF NOT EXISTS localization_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'en',
  target_language TEXT NOT NULL,
  listing_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_localization_jobs_user_id
  ON localization_jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_localization_jobs_created_at
  ON localization_jobs(created_at DESC);

-- 4. Localized listings table (one row per listing in a job)
CREATE TABLE IF NOT EXISTS localized_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES localization_jobs(id) ON DELETE CASCADE,
  original_data JSONB NOT NULL DEFAULT '{}',
  localized_data JSONB NOT NULL DEFAULT '{}',
  quality_flags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_localized_listings_job_id
  ON localized_listings(job_id);

-- 5. Comments
COMMENT ON COLUMN profiles.plan_tier IS 'Subscription tier: free, starter, growth, scale';
COMMENT ON COLUMN profiles.listings_used_this_month IS 'Number of listings localized in the current billing period';
COMMENT ON COLUMN profiles.listings_reset_date IS 'Date when listings_used_this_month resets (start of billing period)';
COMMENT ON TABLE localization_jobs IS 'Tracks each localization request (CSV upload) for history and usage';
COMMENT ON TABLE localized_listings IS 'Individual listing results within a localization job';
