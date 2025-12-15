import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

// Init Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string 
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { text, target_languages, style, userId } = req.body;

  if (!text || !target_languages || target_languages.length === 0) {
    return res.status(400).json({ error: "Missing text or languages" });
  }

  try {
    // 1. Check if User is Pro
    let model = "gpt-3.5-turbo"; // Default for free users

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', userId)
        .single();

      if (profile?.is_pro) {
        model = "gpt-4o"; // 🚀 Upgrade for Pro Users
        console.log(`💎 User is PRO. Using ${model} for superior quality.`);
      } else {
        console.log(`👤 User is FREE. Using ${model}.`);
      }
    }

    // 2. The Prompt
    const prompt = `
      Translate the following text: "${text}"
      Target Languages: ${target_languages.join(", ")}
      Style/Vibe: ${style} (Crucial: Adapt the tone strictly to this vibe!)

      Return JSON format: { "results": [ { "language": "Spanish", "translation": "...", "reality_check": "Literal meaning..." } ] }
    `;

    // 3. Call OpenAI with the selected model
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert localization engine. Do not just translate words; translate the cultural feeling." }, 
        { role: "user", content: prompt }
      ],
      model: model, // Dynamic model selection
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content);

    // 4. Save to History
    if (userId) {
        const historyRecords = data.results.map(item => ({
            user_id: userId,
            original_text: text,
            translated_text: item.translation,
            language: item.language,
            style: style
        }));

        await supabase.from('translations').insert(historyRecords);
    }

    res.status(200).json(data);

  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
}