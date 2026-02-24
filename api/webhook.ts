import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Supabase admin credentials are not configured');
  return createClient(url, serviceKey);
}

// Configuration for Vercel to handle raw body (Critical for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body (Vercel serverless)
async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Use rawBody from Express (set by express.json verify callback) or read stream for Vercel
    const buf = req.rawBody ? Buffer.from(req.rawBody) : await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify the event is genuinely from Stripe
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret as string);
    } catch (err: any) {
      console.error(`Webhook Signature Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.client_reference_id ||
                     session.metadata?.userId ||
                     session.metadata?.user_id;

      const customerId = session.customer as string;

      console.log(`Payment success for User: ${userId}`);

      if (userId) {
        const planTier = session.metadata?.plan || 'starter';

        const { error } = await supabase
          .from('profiles')
          .update({
            is_pro: true,
            plan_tier: planTier,
            stripe_customer_id: customerId,
            listings_used_this_month: 0,
            listings_reset_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Supabase update failed:', error);
          return res.status(500).send('Database Error');
        }

        console.log(`User ${userId} upgraded to ${planTier} successfully`);
      } else {
        console.warn('No user ID found in session metadata or client_reference_id');
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      console.log(`Subscription cancelled for customer: ${customerId}`);

      const { error } = await supabase
        .from('profiles')
        .update({
          is_pro: false,
          plan_tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Supabase downgrade failed:', error);
      }
    }

    res.json({ received: true });

  } catch (error: any) {
    console.error("Webhook handler error:", error?.message || error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
}
