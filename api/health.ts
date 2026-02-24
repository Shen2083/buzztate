export default function handler(req: any, res: any) {
  // Count total env vars and list which expected ones are present
  const envKeys = Object.keys(process.env);
  const expected = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
  ];

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    config: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
      supabaseUrl: !!process.env.VITE_SUPABASE_URL,
      supabaseAnon: !!process.env.VITE_SUPABASE_ANON_KEY,
      supabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
    debug: {
      totalEnvVars: envKeys.length,
      hasVercelEnv: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV || "unset",
      vercelEnv: process.env.VERCEL_ENV || "unset",
      vercelUrl: process.env.VERCEL_URL || "unset",
      vercelProjectProdUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL || "unset",
      vercelGitRepo: process.env.VERCEL_GIT_REPO_SLUG || "unset",
      vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "unset",
      // Show which of our expected vars exist (names only, not values)
      missing: expected.filter((k) => !process.env[k]),
      // Show env var names containing our key prefixes (names only, not values)
      stripeVars: envKeys.filter((k) => k.toUpperCase().includes("STRIPE")),
      supabaseVars: envKeys.filter((k) => k.toUpperCase().includes("SUPABASE")),
      openaiVars: envKeys.filter((k) => k.toUpperCase().includes("OPENAI")),
      viteVars: envKeys.filter((k) => k.startsWith("VITE_")),
      // List all non-system env var names for debugging
      allCustomVars: envKeys.filter((k) => !k.startsWith("AWS_") && !k.startsWith("VERCEL") && !k.startsWith("__") && k !== "PATH" && k !== "HOME" && k !== "NODE_ENV" && k !== "LANG" && k !== "TZ"),
    },
  });
}
