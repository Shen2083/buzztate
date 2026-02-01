import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// Helper to get Supabase client for auth verification
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
};

// Extend Express Request to include verified userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Authentication middleware that verifies JWT tokens from Supabase.
 * Extracts the token from Authorization header and verifies it.
 * Sets req.userId if valid.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("Auth middleware: Missing Supabase configuration");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

/**
 * Optional auth middleware - doesn't reject if no token, but sets userId if valid
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.substring(7);
  const supabase = getSupabaseClient();

  if (!supabase) {
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      req.userId = user.id;
    }
  } catch {
    // Silently continue without auth
  }

  next();
}
