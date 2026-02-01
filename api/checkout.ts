import Stripe from 'stripe';
import { verifyAuth } from './_lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Verify JWT token instead of trusting X-User-ID header
  const { userId, error: authError } = await verifyAuth(req);

  if (authError || !userId) {
    return res.status(401).json({ error: authError || "Unauthorized" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      // Use consistent metadata key: userId (matching server/routes.ts)
      metadata: { userId: userId },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Buzztate Pro Suite',
              description: 'Unlimited languages, CSV exports, and GPT-4o intelligence.',
            },
            unit_amount: 1000, // $10.00
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
