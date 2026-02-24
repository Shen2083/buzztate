import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

// Request validation schema
const verifyPaymentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required")
});

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log("Verifying Payment...");

    // Validate request body
    const parseResult = verifyPaymentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { sessionId } = parseResult.data;
    const stripe = getStripe();
    const supabase = getSupabaseAdmin();
    // IDEMPOTENCY CHECK: Check if we've already processed this session
    const { data: existingEvent } = await supabase
      .from('payment_events')
      .select('id, user_id, processed_at')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingEvent) {
      console.log(`Payment session ${sessionId} already processed at ${existingEvent.processed_at}`);
      return res.json({
        success: true,
        message: "Payment already verified",
        alreadyProcessed: true
      });
    }

    // 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Get userId from metadata or client_reference_id
      const userId = session.metadata?.userId ||
                     session.metadata?.user_id ||
                     session.client_reference_id;
      const customerId = session.customer as string;

      if (userId) {
        console.log(`Paid! Updating User: ${userId}`);

        // Record the payment event FIRST to prevent race conditions
        const { error: insertError } = await supabase
          .from('payment_events')
          .insert({
            stripe_session_id: sessionId,
            user_id: userId
          });

        // If insert fails due to unique constraint, another request got there first
        if (insertError) {
          if (insertError.code === '23505') { // Unique violation
            console.log('Concurrent request already processed this payment');
            return res.json({
              success: true,
              message: "Payment already verified",
              alreadyProcessed: true
            });
          }
          console.error("Failed to record payment event:", insertError);
          // Continue anyway - the upgrade is more important
        }

        // 2. Try to UPDATE the profile
        const { data, error } = await supabase
          .from("profiles")
          .update({
            is_pro: true,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId)
          .select();

        if (error) {
          console.error("Update Failed:", error.message);
          return res.status(500).json({ error: `DB Update Error: ${error.message}` });
        }

        // 3. SELF-HEALING: If no row was updated, the profile is missing. Create it.
        if (!data || data.length === 0) {
          console.warn("Profile not found. Attempting to create one...");

          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              is_pro: true,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            });

          if (createError) {
            console.error("Creation Failed:", createError.message);
            return res.status(500).json({ error: `Profile Creation Failed: ${createError.message}` });
          }
          console.log("Profile created and upgraded.");
        } else {
          console.log("Profile upgraded successfully.");
        }

        return res.json({ success: true, message: "Upgraded to Pro" });
      } else {
        console.warn("No user ID found in payment session");
        return res.json({ success: false, message: "No user ID in session" });
      }
    }

    res.json({ success: false, message: "Payment not complete" });

  } catch (error: any) {
    console.error("Verification Critical Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
