import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Helper to get Stripe instance safely
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" });
};

// Helper to get Supabase Admin instance safely
const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export async function registerRoutes(app: Express): Promise<Server> {

  // ---------------------------------------------------------
  // 1. CHECKOUT SESSION CREATION
  // ---------------------------------------------------------
  app.post("/api/checkout", async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) throw new Error("Missing STRIPE_SECRET_KEY");

      const userId = req.headers["x-user-id"];
      if (!userId || typeof userId !== "string") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Buzztate Pro Suite",
                description: "Unlimited translations, CSV exports, and all 7 vibes.",
              },
              unit_amount: 1000, 
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
          metadata: { userId: userId },

          // 🚨 CHANGE THIS LINE: Change '/home' to '/app'
          success_url: `${req.headers.origin}/app?payment=success&session_id={CHECKOUT_SESSION_ID}`,

          // 🚨 CHANGE THIS LINE: Change '/home' to '/app'
          cancel_url: `${req.headers.origin}/app`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ---------------------------------------------------------
  // 2. MANUAL VERIFICATION (The "Self-Healing" Fix)
  // ---------------------------------------------------------
  app.post("/api/verify-payment", async (req, res) => {
    console.log("🔍 Verifying Payment...");
    try {
      const { sessionId } = req.body;
      const stripe = getStripe();
      const supabase = getSupabaseAdmin();

      if (!stripe || !supabase) {
        console.error("❌ Server Config Error: Missing Stripe or Supabase keys");
        return res.status(500).json({ error: "Server Configuration Error" });
      }
      if (!sessionId) return res.status(400).json({ error: "Missing Session ID" });

      // 1. Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;

        if (userId) {
          console.log(`💰 Paid! Updating User: ${userId}`);

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
            console.error("❌ Update Failed:", error.message);
            return res.status(500).json({ error: `DB Update Error: ${error.message}` });
          }

          // 3. SELF-HEALING: If no row was updated, the profile is missing. Create it.
          if (!data || data.length === 0) {
            console.warn("⚠️ Profile not found. Attempting to create one...");

            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: userId,
                is_pro: true,
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
              });

            if (insertError) {
               console.error("❌ Creation Failed:", insertError.message);
               return res.status(500).json({ error: `Profile Creation Failed: ${insertError.message}` });
            }
            console.log("✅ Profile created and upgraded.");
          } else {
            console.log("✅ Profile upgraded successfully.");
          }

          return res.json({ success: true, message: "Upgraded to Pro" });
        }
      }

      res.json({ success: false, message: "Payment not complete" });

    } catch (error: any) {
      console.error("Verification Critical Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ---------------------------------------------------------
  // 3. STRIPE PORTAL
  // ---------------------------------------------------------
  app.post("/api/portal", async (req, res) => {
    try {
      const stripe = getStripe();
      const supabase = getSupabaseAdmin();
      const userId = req.headers["x-user-id"];

      if (!userId || typeof userId !== "string") return res.status(401).json({ error: "Unauthorized" });
      if (!stripe || !supabase) throw new Error("Server Misconfigured");

      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (!profile?.stripe_customer_id) {
        return res.status(400).json({ error: "No active subscription found." });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${req.headers.origin}/home`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}