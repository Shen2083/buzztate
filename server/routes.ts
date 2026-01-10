import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import express from 'express';

// Helper to get Stripe instance safely
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia", 
  });
};

// Helper to get Supabase Admin instance safely (Lazy Init)
const getSupabaseAdmin = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(`Missing Supabase Credentials. URL: ${!!url}, Key: ${!!key}`);
  }
  return createClient(url, key);
};

export async function registerRoutes(app: Express): Promise<Server> {

  // ---------------------------------------------------------
  // 1. CHECKOUT SESSION CREATION
  // ---------------------------------------------------------
  app.post("/api/checkout", async (req, res) => {
    try {
      const stripe = getStripe();
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
          userId: userId, 
        },
        success_url: `${req.headers.origin}/home?payment=success`,
        cancel_url: `${req.headers.origin}/home`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ---------------------------------------------------------
  // 2. STRIPE PORTAL
  // ---------------------------------------------------------
  app.post("/api/portal", async (req, res) => {
    try {
      const stripe = getStripe();
      const supabaseAdmin = getSupabaseAdmin();
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
  // 3. WEBHOOK HANDLER
  // ---------------------------------------------------------
  app.post(
    "/api/webhook",
    // We try to get raw body. If it fails (already parsed), we handle it below.
    express.raw({ type: "application/json" }), 
    async (req, res) => {
      console.log("🔔 Webhook hit!");

      try {
        const signature = req.headers["stripe-signature"];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const stripe = getStripe();
        const supabaseAdmin = getSupabaseAdmin();

        if (!signature || !webhookSecret) {
          console.error("❌ Configuration Error: Missing signature or secret");
          return res.status(400).send("Webhook Configuration Error");
        }

        let event: Stripe.Event;

        // Vercel/Express Body Parsing Fix
        // If req.body is a Buffer, use it. If it's already JSON, stringify it (fallback).
        const payload = Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);

        try {
          event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
          console.error(`⚠️ Signature Verification Failed: ${err.message}`);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log(`✅ Event Received: ${event.type}`);

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
              console.error("❌ DB Update Failed:", error);
              return res.status(500).send("Database Error");
            } 
            console.log("✅ User upgraded successfully.");
          } else {
            console.warn("⚠️ No User ID in metadata");
          }
        }

        res.json({ received: true });

      } catch (err: any) {
        console.error("🔥 Critical Webhook Error:", err.message);
        // Return 200 to Stripe so it stops retrying if it's a code error (prevent infinite loops)
        // But log it loudly for you.
        res.status(500).send(`Server Error: ${err.message}`);
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}