import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";
import { translateRequestSchema } from '../shared/schema';
import { verifyAuth } from './_lib/auth';

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Supabase admin credentials are not configured');
  return createClient(url, serviceKey);
}

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  return new OpenAI({ apiKey });
}

// Security Limits
const LIMITS = {
  FREE: {
    CHARS: 280,       // Tweet size
    LANGUAGES: 1,     // One language at a time
    ALLOWED_STYLES: ["Modern Slang"] // Only basic style
  },
  PRO: {
    CHARS: 5000,      // ~2 pages of text
    LANGUAGES: 50,    // Unlimited essentially
    ALLOWED_STYLES: "ALL"
  }
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // Validate request body with Zod
    const parseResult = translateRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors
      });
    }

    const { text, target_languages, style } = parseResult.data;

    // Try to get authenticated user (optional for demo/free users)
    const { userId: authUserId } = await verifyAuth(req);

    // Use authenticated userId if available, fallback to body userId for backwards compatibility
    const userId = authUserId || parseResult.data.userId;

    const supabase = getSupabaseAdmin();
    const openai = getOpenAI();

    // 1. Determine User Status
    let isPro = false;
    let model = "gpt-3.5-turbo"; // Default

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', userId)
        .single();

      if (profile?.is_pro) {
        isPro = true;
        model = "gpt-4o"; // Upgrade for Pro
        console.log(`User is PRO. Using ${model}.`);
      } else {
        console.log(`User is FREE. Using ${model}.`);
      }
    }

    // 2. THE GATEKEEPER: Enforce Limits based on Status
    const currentLimit = isPro ? LIMITS.PRO : LIMITS.FREE;

    // A. Character Limit
    if (text.length > currentLimit.CHARS) {
      return res.status(403).json({
        error: `Text too long! ${isPro ? 'Pro' : 'Free'} limit is ${currentLimit.CHARS} characters.${!isPro ? ' Upgrade to Pro for more.' : ''}`
      });
    }

    // B. Language Count Limit
    if (target_languages.length > currentLimit.LANGUAGES) {
      return res.status(403).json({
        error: `${isPro ? 'Pro' : 'Free'} plan is limited to ${currentLimit.LANGUAGES} language(s) at a time.${!isPro ? ' Upgrade to Pro for mass translation.' : ''}`
      });
    }

    // C. Style/Vibe Limit - Force to Modern Slang if not Pro
    let effectiveStyle = style;
    if (!isPro && !LIMITS.FREE.ALLOWED_STYLES.includes(style)) {
      console.log(`Free user tried '${style}'. Forcing 'Modern Slang'.`);
      effectiveStyle = "Modern Slang";
    }

    // 3. The Prompt
    const prompt = `
      Translate the following text: "${text}"
      Target Languages: ${target_languages.join(", ")}
      Style/Vibe: ${effectiveStyle} (Crucial: Adapt the tone strictly to this vibe!)

      Return JSON format: { "results": [ { "language": "Spanish", "translation": "...", "reality_check": "Literal meaning..." } ] }
    `;

    // 4. Call OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert localization engine. Do not just translate words; translate the cultural feeling." },
        { role: "user", content: prompt }
      ],
      model: model,
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content || '{"results":[]}');

    // 5. Save to History
    if (userId) {
      const historyRecords = data.results.map((item: any) => ({
        user_id: userId,
        original_text: text,
        translated_text: item.translation,
        language: item.language,
        style: effectiveStyle
      }));

      await supabase.from('translations').insert(historyRecords);
    }

    res.status(200).json(data);

  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed. Please try again." });
  }
}
