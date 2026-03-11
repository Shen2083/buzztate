import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/set-plus
 * Promotes a user to Plus plan by email.
 * Protected by ADMIN_SECRET env var — never expose publicly.
 *
 * Body: { email: string, secret: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, secret } = req.body || {};

  // Protect with a shared secret
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || secret !== adminSecret) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(500).json({ error: "Supabase admin credentials not configured" });
  }

  const supabase = createClient(url, serviceKey);

  // Look up user by email in auth.users
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    return res.status(500).json({ error: "Could not list users" });
  }

  const user = users.users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ error: `No user found with email: ${email}` });
  }

  // Update their profile to Plus
  const { error: updateError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      is_pro: true,
      plan_tier: "plus",
      listings_used_this_month: 0,
    }, { onConflict: "id" });

  if (updateError) {
    console.error("Failed to update profile:", updateError);
    return res.status(500).json({ error: "Failed to update profile" });
  }

  return res.status(200).json({
    success: true,
    message: `${email} has been set to Plus plan`,
    userId: user.id,
  });
}
