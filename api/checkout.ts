import Stripe from 'stripe';
import { verifyAuth } from './_lib/auth.js';

// Singleton Stripe client — created once on first use
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  stripeClient = new Stripe(key, { timeout: 15000 });
  return stripeClient;
}

/** Plan definitions — simplified to a single paid tier */
const PLANS: Record<string, { name: string; description: string; amount: number; currency: string }> = {
  plus: {
    name: 'Buzztate Plus',
    description: 'Unlimited localizations, up to 200 per batch, all marketplaces, priority processing.',
    amount: 4900, // $49.00
    currency: 'usd',
  },
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Quick env-var check before doing any async work
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Checkout Error: STRIPE_SECRET_KEY not set");
      return res.status(503).json({ error: "Payment system is not configured. Please contact support." });
    }

    // Verify JWT token
    const { userId, error: authError } = await verifyAuth(req);

    if (authError || !userId) {
      return res.status(401).json({ error: authError || "Unauthorized" });
    }

    // Determine which plan the user wants
    const planId = req.body?.plan || 'plus';
    const plan = PLANS[planId];

    if (!plan) {
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
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: `By subscribing, you agree to our [Terms of Service](${origin}/terms) and [Privacy Policy](${origin}/privacy).`,
        },
      },
      success_url: `${origin}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error("Checkout Error:", error?.message || error);
    if (res.headersSent) return;
    if (error?.message?.includes('STRIPE_SECRET_KEY')) {
      return res.status(503).json({ error: "Payment system is not configured. Please contact support." });
    }
    return res.status(500).json({ error: error?.message || "Could not initiate checkout. Please try again later." });
  }
}
