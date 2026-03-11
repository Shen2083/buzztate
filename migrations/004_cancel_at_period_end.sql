-- Add cancel_at_period_end and current_period_end columns for graceful subscription cancellation tracking

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end timestamptz DEFAULT NULL;

COMMENT ON COLUMN profiles.cancel_at_period_end IS 'True when user has cancelled but subscription is still active until period end';
COMMENT ON COLUMN profiles.current_period_end IS 'When the current billing period ends (used for grace period display)';
