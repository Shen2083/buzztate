export default function handler(req: any, res: any) {
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
  });
}
