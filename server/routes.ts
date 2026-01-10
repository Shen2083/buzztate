import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import express from 'express';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE credentials are missing");
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia", 
});

// Initialize Supabase Admin (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function registerRoutes(app: Express): Promise<Server> {

  // ---------------------------------------------------------
  // 1. CHECKOUT SESSION CREATION
  // ---------------------------------------------------------
  app.post("/api/checkout", async (req, res) => {
    try {
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
        // ✅ CRITICAL: Sending userId in metadata so webhook can find the user later
        metadata: {
          userId: userId,
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
  // 2. STRIPE PORTAL (Manage Subscription)
  // ---------------------------------------------------------
  app.post("/api/portal", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId || typeof userId !== "string") return res.status(401).json({ error: "Unauthorized" });

      // Find the user's stripe_customer_id from Supabase
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
  // 3. WEBHOOK HANDLER (The Fix)
  // ---------------------------------------------------------
  // Note: We need raw body for signature verification. 
  // This middleware ensures ONLY this route gets the raw buffer.
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }), 
    async (req, res) => {
      const signature = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!signature || !webhookSecret) {
        console.error("❌ Missing signature or webhook secret");
        return res.status(400).send("Webhook Error: Missing secret or signature");
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err: any) {
        console.error(`⚠️  Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // ✅ HANDLE SUCCESSFUL PAYMENT
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;

        console.log(`💰 Payment success for User ID: ${userId}`);

        if (userId) {
          // 1. Update Supabase Profile to PRO
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({ 
              is_pro: true,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            })
            .eq("id", userId);

          if (error) {
            console.error("❌ Failed to update Supabase profile:", error);
            return res.status(500).send("Database Update Failed");
          }

          console.log("✅ Supabase profile updated to PRO.");
        }
      }

      // ✅ HANDLE SUBSCRIPTION CANCELLATION (Optional)
      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        // You'd need to lookup the user by customer_id here usually
        const { error } = await supabaseAdmin
            .from("profiles")
            .update({ is_pro: false })
            .eq("stripe_customer_id", subscription.customer);

        if (!error) console.log("⚠️ Subscription deleted/expired. User downgraded.");
      }

      res.json({ received: true });
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}