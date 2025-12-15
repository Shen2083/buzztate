import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string 
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(400).json({ error: "User ID required" });

  try {
    // 1. Get the Stripe Customer ID from Supabase
    // (We assume you saved this during webhook. If not, we might need to search Stripe by email)
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email') // Ensure you have this column!
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Fallback: If we didn't save the ID, search Stripe by email
    if (!customerId && profile?.email) {
       const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
       if (customers.data.length > 0) {
         customerId = customers.data[0].id;
       }
    }

    if (!customerId) {
        return res.status(404).json({ error: "No billing record found for this user." });
    }

    // 2. Create the Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin}/`, // Where to send them after they are done
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Portal Error:", error);
    return res.status(500).json({ error: "Could not open billing portal" });
  }
}