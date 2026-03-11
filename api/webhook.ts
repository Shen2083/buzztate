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
        const planTier = session.metadata?.plan || 'plus';

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

    // Handle subscription updates (cancel-at-period-end, reactivation, status changes)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      console.log(`Subscription updated for customer: ${customerId}, status: ${subscription.status}, cancel_at_period_end: ${subscription.cancel_at_period_end}`);

      if (subscription.status === 'active') {
        // Active subscription — update cancel_at_period_end tracking
        const updateData: Record<string, any> = {
          is_pro: true,
          plan_tier: 'plus',
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Supabase subscription update failed:', error);
        }
      } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
        // Downgrade to free
        const { error } = await supabase
          .from('profiles')
          .update({
            is_pro: false,
            plan_tier: 'free',
            cancel_at_period_end: false,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Supabase downgrade on status change failed:', error);
        }
      }
    }

    // Handle subscription deletion (final cancellation after period end)
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      console.log(`Subscription deleted for customer: ${customerId}`);

      const { error } = await supabase
        .from('profiles')
        .update({
          is_pro: false,
          plan_tier: 'free',
          cancel_at_period_end: false,
          current_period_end: null,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);

      if (error) {
        console.error('Supabase downgrade failed:', error);
      }
    }

    // Handle failed invoice payments (log but don't immediately downgrade)
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      console.warn(`Payment failed for customer: ${customerId}, invoice: ${invoice.id}, attempt: ${invoice.attempt_count}`);

      // Stripe will retry automatically and eventually mark subscription as past_due/unpaid
      // which will be handled by customer.subscription.updated above
    }

    res.json({ received: true });

  } catch (error: any) {
    console.error("Webhook handler error:", error?.message || error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
}
