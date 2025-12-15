import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Get the User ID we sent from the frontend
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({ error: "Missing User ID" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      // 2. Attach the User ID to the transaction so we can retrieve it later
      client_reference_id: userId,
      metadata: {
        user_id: userId 
      },

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Buzztate Pro Suite',
              description: 'Unlimited languages, CSV exports, and all vibe styles.',
            },
            unit_amount: 1000, // $10.00
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/app?payment=success`,
      cancel_url: `${req.headers.origin}/`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(500).json({ error: error.message });
  }
}