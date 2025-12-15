import Stripe from 'stripe';

export default async function handler(req, res) {
  try {
    // 1. debug: Check if Key exists (Don't reveal the whole key, just the start)
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("CRITICAL: STRIPE_SECRET_KEY is missing from env vars.");

    // 2. debug: Check if Stripe initializes
    console.log("Initializing Stripe with key starting:", key.substring(0, 8));
    const stripe = new Stripe(key);

    if (req.method !== 'POST') {
       // If we get here, Stripe loaded successfully!
       return res.status(200).json({ status: "Alive", message: "Stripe loaded correctly. Send a POST request to test checkout." });
    }

    // 3. The actual checkout logic
    const userId = req.headers['x-user-id'];
    if (!userId) throw new Error("Missing 'X-User-ID' in headers.");

    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      metadata: { user_id: userId },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Buzztate Pro Suite',
              description: 'Unlimited languages, CSV exports, and all vibe styles.',
            },
            unit_amount: 1000, 
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

  } catch (error: any) {
    // 4. CATCH THE CRASH and print it
    console.error("Server Crash:", error);
    return res.status(500).json({ 
      error: "Server Crash Diagnostic", 
      details: error.message, 
      stack: error.stack 
    });
  }
}