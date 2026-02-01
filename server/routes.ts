import type { Express } from "express";
import type { Server } from "http";
import { generalLimiter } from "./middleware/rateLimit";

/**
 * Register routes for the Express server.
 *
 * NOTE: Payment routes (checkout, verify-payment, portal) have been moved to
 * Vercel serverless functions in /api/ directory. This eliminates duplicate
 * route definitions and ensures consistent behavior across environments.
 *
 * The Vercel functions now handle:
 * - POST /api/checkout - Creates Stripe checkout session
 * - POST /api/verify-payment - Verifies payment with idempotency
 * - POST /api/portal - Opens Stripe billing portal
 * - POST /api/webhook - Handles Stripe webhooks
 * - POST /api/translate - Translation endpoint
 */
export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  // Apply general rate limiting to all API routes
  app.use("/api", generalLimiter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
