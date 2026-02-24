import Stripe from 'stripe';
import { verifyAuth } from './_lib/auth';

// Singleton Stripe client — created once on first use
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  stripeClient = new Stripe(key, { timeout: 15000 });
  return stripeClient;
}

/** Plan definitions matching the new e-commerce tier structure */
const PLANS: Record<string, { name: string; description: string; amount: number; currency: string }> = {
  starter: {
    name: 'Buzztate Starter',
    description: '100 listings/month, 5 languages, all marketplaces.',
    amount: 2900, // £29.00
    currency: 'gbp',
  },
  growth: {
    name: 'Buzztate Growth',
    description: '500 listings/month, all languages, priority processing.',
    amount: 5900, // £59.00
    currency: 'gbp',
  },
  scale: {
    name: 'Buzztate Scale',
    description: 'Unlimited listings, API access, bulk processing.',
    amount: 9900, // £99.00
    currency: 'gbp',
  },
};

export default async function handler(req: any, res: any) {
  // Guard: ensure we always respond within 25s (Replit proxy times out at ~30s)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("Checkout handler timed out");
      res.status(504).json({ error: "Request timed out. Please try again." });
    }
  }, 25000);

  try {
    if (req.method !== 'POST') {
      clearTimeout(timeout);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Quick env-var check before doing any async work
    if (!process.env.STRIPE_SECRET_KEY) {
      clearTimeout(timeout);
      console.error("Checkout Error: STRIPE_SECRET_KEY not set");
      return res.status(503).json({ error: "Payment system is not configured. Please contact support." });
    }

    // Verify JWT token
    const { userId, error: authError } = await verifyAuth(req);

    if (authError || !userId) {
      clearTimeout(timeout);
      return res.status(401).json({ error: authError || "Unauthorized" });
    }

    // Determine which plan the user wants
    const planId = req.body?.plan || 'starter';
    const plan = PLANS[planId];

    if (!plan) {
      clearTimeout(timeout);
      return res.status(400).json({ error: `Invalid plan: ${planId}. Valid plans: ${Object.keys(PLANS).join(', ')}` });
    }

    const stripe = getStripe();
    const origin = req.headers.origin || req.headers.referer?.replace(/\/[^/]*$/, '') || process.env.APP_URL || 'https://buzztate.com';

    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      metadata: { userId, plan: planId },
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app`,
    });

    clearTimeout(timeout);
    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    clearTimeout(timeout);
    console.error("Checkout Error:", error?.message || error);
    if (res.headersSent) return;
    if (error?.message?.includes('STRIPE_SECRET_KEY')) {
      return res.status(503).json({ error: "Payment system is not configured. Please contact support." });
    }
    return res.status(500).json({ error: error?.message || "Could not initiate checkout. Please try again later." });
  }
}
