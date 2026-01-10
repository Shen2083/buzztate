import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import express from 'express';

// Initialize Stripe (Safe Init)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia", 
});

// Initialize Supabase Admin (Safe Init)
// We use the Service Role Key to bypass RLS and update the user profile
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function registerRoutes(app: Express): Promise<Server> {

  // ---------------------------------------------------------
  // 1. CHECKOUT SESSION CREATION
  // ---------------------------------------------------------
  app.post("/api/checkout", async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");

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
              unit_amount: 1000, // $10.00
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        metadata: {
          userId: userId, // ✅ Critical for webhook matching
        },
        success_url: `${req.headers.origin}/home?payment=success`,
        cancel_url: `${req.headers.origin}/home`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ---------------------------------------------------------
  // 2. STRIPE PORTAL
  // ---------------------------------------------------------
  app.post("/api/portal", async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");

      const userId = req.headers["x-user-id"];
      if (!userId || typeof userId !== "string") return res.status(401).json({ error: "Unauthorized" });

      const { data: profile } = await supabaseAdmin
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

  // ---------------------------------------------------------
  // 3. WEBHOOK HANDLER (Robust Version)
  // ---------------------------------------------------------
  // We use express.raw to try and catch the buffer, but we add extra safety checks
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }), 
    async (req, res) => {
      const signature = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      // 1. Validate Config
      if (!webhookSecret) {
        console.error("❌ STRIPE_WEBHOOK_SECRET is missing in env vars");
        return res.status(500).send("Server Configuration Error");
      }
      if (!signature) {
        console.error("❌ No stripe-signature header found");
        return res.status(400).send("Webhook Error: Missing signature");
      }

      let event: Stripe.Event;

      // 2. Construct Event (Handle Buffer vs JSON conflict)
      try {
        // If req.body is already a JSON object (parsed by global middleware), 
        // we can't verify the signature easily. 
        // Ideally, this route should be defined BEFORE any `app.use(express.json())`.
        const body = Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);

        // Note: JSON.stringify(req.body) is a fallback and might fail signature verification 
        // if whitespace differs. Ideally, ensure `express.raw` works.

        event = stripe.webhooks.constructEvent(
          req.body, // Pass the raw body directly if possible
          signature,
          webhookSecret
        );
      } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log(`🔔 Webhook received: ${event.type}`);

      try {
        // ✅ HANDLE SUCCESSFUL PAYMENT
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const customerId = session.customer as string;

          if (userId) {
            console.log(`💰 Upgrading User: ${userId}`);

            const { error } = await supabaseAdmin
              .from("profiles")
              .update({ 
                is_pro: true,
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
              })
              .eq("id", userId);

            if (error) {
              console.error("❌ Supabase Update Failed:", error);
              // Do NOT return 500 here, or Stripe will retry indefinitely. 
              // Log it and alert yourself.
            } else {
              console.log("✅ User upgraded to PRO successfully.");
            }
          } else {
            console.warn("⚠️ No userId found in session metadata");
          }
        }

        // ✅ HANDLE CANCELLATION
        if (event.type === "customer.subscription.deleted") {
          const subscription = event.data.object as Stripe.Subscription;
          const { error } = await supabaseAdmin
              .from("profiles")
              .update({ is_pro: false })
              .eq("stripe_customer_id", subscription.customer);

          if (!error) console.log("📉 Subscription deleted. User downgraded.");
        }

        res.json({ received: true });

      } catch (err: any) {
        console.error("❌ Webhook Handler Logic Error:", err);
        res.status(500).send("Server Error inside Webhook");
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}