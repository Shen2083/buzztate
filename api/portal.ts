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
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email') 
      .eq('id', userId)
      .single();

    if (dbError) {
        console.error("Supabase Lookup Error:", dbError);
    }

    let customerId = profile?.stripe_customer_id;

    // Fallback: If no ID in DB, search Stripe by email
    // Note: This relies on 'email' actually existing in your 'profiles' table. 
    // If it's only in auth.users, this step will fail.
    if (!customerId && profile?.email) {
       console.log(`Searching Stripe for email: ${profile.email}`);
       const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
       if (customers.data.length > 0) {
         customerId = customers.data[0].id;
         // Optional: Save this ID back to your DB so you don't search next time
       }
    }

    if (!customerId) {
        console.error(`❌ Failed: No Stripe Customer ID found for user ${userId}`);
        return res.status(404).json({ error: "No billing record found. Please subscribe first." });
    }

    // 2. Define Return URL (Fixing the potential 'undefined' bug)
    // If origin is missing, fallback to your homepage (adjust localhost port if needed)
    const origin = req.headers.origin || 'http://localhost:5173'; 

    // 3. Create the Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`, 
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error("🔥 Portal Error:", error.message);
    return res.status(500).json({ error: error.message || "Could not open billing portal" });
  }
}