import type { Express } from "express";
import type { Server } from "http";
import { generalLimiter } from "./middleware/rateLimit";

// Import API handlers (Vercel-style, compatible with Express req/res)
import checkoutHandler from "../api/checkout";
import portalHandler from "../api/portal";
import verifyPaymentHandler from "../api/verify-payment";
import translateHandler from "../api/translate";
import localizeHandler from "../api/localize";

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  // Apply general rate limiting to all API routes
  app.use("/api", generalLimiter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Payment routes
  app.post("/api/checkout", (req, res) => checkoutHandler(req, res));
  app.post("/api/portal", (req, res) => portalHandler(req, res));
  app.post("/api/verify-payment", (req, res) => verifyPaymentHandler(req, res));

  // Webhook route — uses req.rawBody for Stripe signature verification
  // (rawBody is captured by express.json verify callback in server/index.ts)
  const webhookModule = await import("../api/webhook");
  app.post("/api/webhook", (req, res) => {
    // Make rawBody available as a readable stream fallback
    (req as any)._rawBodyBuffer = (req as any).rawBody;
    webhookModule.default(req, res);
  });

  // Translation & localization routes
  app.post("/api/translate", (req, res) => translateHandler(req, res));
  app.post("/api/localize", (req, res) => localizeHandler(req, res));
}
