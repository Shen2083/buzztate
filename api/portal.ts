import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from './_lib/auth';

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

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Portal Error: STRIPE_SECRET_KEY not set");
      return res.status(503).json({ error: "Payment system is not configured. Please contact support." });
    }

    // Verify JWT token instead of trusting X-User-ID header
    const { userId, error: authError } = await verifyAuth(req);

    if (authError || !userId) {
      return res.status(401).json({ error: authError || "Unauthorized" });
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // 1. Get the Stripe Customer ID from Supabase
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (dbError) {
      console.error("Supabase Lookup Error:", dbError);
    }

    let customerId = profile?.stripe_customer_id;

    // Fallback: If no ID in DB, search Stripe by email
    if (!customerId && profile?.email) {
      console.log(`Searching Stripe for email: ${profile.email}`);
      const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        // Save this ID back to DB so we don't search next time
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      }
    }

    if (!customerId) {
      console.error(`Failed: No Stripe Customer ID found for user ${userId}`);
      return res.status(404).json({ error: "No billing record found. Please subscribe first." });
    }

    // 2. Define Return URL
    const origin = req.headers.origin || req.headers.referer?.replace(/\/[^/]*$/, '') || process.env.APP_URL || 'https://buzztate.com';

    // 3. Create the Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error("Portal Error:", error?.message || error);
    if (res.headersSent) return;
    return res.status(500).json({ error: error?.message || "Could not open billing portal" });
  }
}
