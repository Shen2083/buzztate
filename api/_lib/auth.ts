import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for auth verification
const getSupabaseClient = () => {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
};

export interface AuthResult {
  userId: string | null;
  error: string | null;
}

/**
 * Verifies the JWT token from the Authorization header.
 * For use in Vercel serverless functions.
 *
 * @param req - The incoming request object
 * @returns AuthResult with userId if valid, error message if not
 */
export async function verifyAuth(req: { headers: Record<string, string | string[] | undefined> }): Promise<AuthResult> {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return { userId: null, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { userId: null, error: "Server configuration error" };
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { userId: null, error: "Invalid or expired token" };
    }

    return { userId: user.id, error: null };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { userId: null, error: "Authentication failed" };
  }
}

/**
 * Helper to require authentication in Vercel functions.
 * Returns a response object if auth fails, null if auth succeeds.
 */
export async function requireAuth(
  req: { headers: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (data: any) => any } }
): Promise<{ userId: string } | null> {
  const { userId, error } = await verifyAuth(req);

  if (error || !userId) {
    res.status(401).json({ error: error || "Unauthorized" });
    return null;
  }

  return { userId };
}
