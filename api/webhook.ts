import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Init Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Init Supabase with Service Role (God Mode) to update profiles
const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Configuration for Vercel to handle raw body (Critical for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify the event is genuinely from Stripe
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id; 

    console.log(`💰 Payment success for User: ${userId}`);

    if (userId) {
      // Unlock Pro features in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId);

      if (error) {
        console.error('Supabase update failed:', error);
        return res.status(500).send('Database Error');
      }
    }
  }

  res.json({ received: true });
}