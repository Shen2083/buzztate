-- Payment Events Table for Idempotent Payment Verification
-- This table prevents race conditions by tracking processed payment sessions.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create payment_events table
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by stripe_session_id
CREATE INDEX IF NOT EXISTS idx_payment_events_stripe_session_id
  ON payment_events(stripe_session_id);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_payment_events_user_id
  ON payment_events(user_id);

-- Add comment for documentation
COMMENT ON TABLE payment_events IS 'Tracks processed payment sessions to ensure idempotent payment verification';
COMMENT ON COLUMN payment_events.stripe_session_id IS 'Unique Stripe checkout session ID';
COMMENT ON COLUMN payment_events.user_id IS 'User ID who made the payment';
COMMENT ON COLUMN payment_events.processed_at IS 'Timestamp when payment was processed';
