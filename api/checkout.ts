import Stripe from 'stripe';
import { verifyAuth } from './_lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Verify JWT token
  const { userId, error: authError } = await verifyAuth(req);

  if (authError || !userId) {
    return res.status(401).json({ error: authError || "Unauthorized" });
  }

  // Determine which plan the user wants
  const planId = req.body?.plan || 'starter';
  const plan = PLANS[planId];

  if (!plan) {
    return res.status(400).json({ error: `Invalid plan: ${planId}. Valid plans: ${Object.keys(PLANS).join(', ')}` });
  }

  try {
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
      success_url: `${req.headers.origin}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/app`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return res.status(500).json({ error: "Could not initiate checkout. Please try again later." });
  }
}
