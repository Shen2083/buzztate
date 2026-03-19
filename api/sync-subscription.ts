import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './_lib/auth.js';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  stripeClient = new Stripe(key, { timeout: 15000 });
  return stripeClient;
}

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Supabase admin credentials are not configured');
  return createClient(url, serviceKey);
}

/**
 * Self-healing endpoint: checks the user's actual Stripe subscription status
 * and syncs is_pro in the profiles table. Called when stripe_customer_id exists
 * but is_pro is false — catches webhook failures and stale state.
 */
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId, error: authError } = await verifyAuth(req);
    if (authError || !userId) {
      return res.status(401).json({ error: authError || "Unauthorized" });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // 1. Get stripe_customer_id from profiles
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (dbError || !profile?.stripe_customer_id) {
      return res.json({ is_pro: false, synced: false });
    }

    // 2. Check actual subscription status in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    const hasActive = subscriptions.data.length > 0;

    // 3. Sync is_pro to match Stripe reality
    const updateData: Record<string, any> = {
      is_pro: hasActive,
      plan_tier: hasActive ? 'plus' : 'free',
      updated_at: new Date().toISOString(),
    };

    if (hasActive) {
      const sub = subscriptions.data[0];
      updateData.cancel_at_period_end = sub.cancel_at_period_end;
      updateData.current_period_end = new Date(sub.current_period_end * 1000).toISOString();
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('sync-subscription update failed:', updateError);
      return res.status(500).json({ error: 'Failed to sync subscription status' });
    }

    console.log(`Subscription synced for user ${userId}: is_pro=${hasActive}`);
    return res.json({
      is_pro: hasActive,
      synced: true,
      cancel_at_period_end: hasActive ? subscriptions.data[0].cancel_at_period_end : false,
      current_period_end: hasActive ? new Date(subscriptions.data[0].current_period_end * 1000).toISOString() : null,
    });

  } catch (error: any) {
    console.error("sync-subscription error:", error?.message || error);
    if (res.headersSent) return;
    return res.status(500).json({ error: error?.message || "Failed to sync subscription" });
  }
}
