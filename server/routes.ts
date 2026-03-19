import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { generalLimiter } from "./middleware/rateLimit";

// Import API handlers (Vercel-style, compatible with Express req/res)
import healthHandler from "../api/health";
import checkoutHandler from "../api/checkout";
import portalHandler from "../api/portal";
import verifyPaymentHandler from "../api/verify-payment";
import translateHandler from "../api/translate";
import localizeHandler from "../api/localize";
import syncSubscriptionHandler from "../api/sync-subscription";

/**
 * Wraps an async handler so Express 4 catches rejected promises.
 * Without this, unhandled async errors leave the response hanging
 * and Replit's proxy returns "A server error has occurred".
 */
function asyncHandler(fn: (req: Request, res: Response) => Promise<any>) {
  return (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error("Unhandled API error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  // 301 redirect: www → non-www + old generic translation pages → homepage
  app.use((req, res, next) => {
    const host = req.hostname;
    if (host === "www.buzztate.com") {
      return res.redirect(301, `https://buzztate.com${req.originalUrl}`);
    }
    if (req.path.startsWith("/translate/")) {
      return res.redirect(301, "/");
    }
    next();
  });

  // Apply general rate limiting to all API routes
  app.use("/api", generalLimiter);

  // Health check endpoint — reuses the Vercel-compatible handler
  app.get("/api/health", (req, res) => healthHandler(req, res));

  // Payment routes
  app.post("/api/checkout", asyncHandler((req, res) => checkoutHandler(req, res)));
  app.post("/api/portal", asyncHandler((req, res) => portalHandler(req, res)));
  app.post("/api/verify-payment", asyncHandler((req, res) => verifyPaymentHandler(req, res)));
  app.post("/api/sync-subscription", asyncHandler((req, res) => syncSubscriptionHandler(req, res)));

  // Webhook route — uses req.rawBody for Stripe signature verification
  // (rawBody is captured by express.json verify callback in server/index.ts)
  const webhookModule = await import("../api/webhook");
  app.post("/api/webhook", asyncHandler((req, res) => {
    // Make rawBody available as a readable stream fallback
    (req as any)._rawBodyBuffer = (req as any).rawBody;
    return webhookModule.default(req, res);
  }));

  // Translation & localization routes
  app.post("/api/translate", asyncHandler((req, res) => translateHandler(req, res)));
  app.post("/api/localize", asyncHandler((req, res) => localizeHandler(req, res)));
}
