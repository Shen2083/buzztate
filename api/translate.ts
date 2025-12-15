import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

// Init Supabase (Service Role to bypass RLS for writing if needed, but we'll use standard auth flow)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string 
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { text, target_languages, style, userId } = req.body; // Added userId

  if (!text || !target_languages || target_languages.length === 0) {
    return res.status(400).json({ error: "Missing text or languages" });
  }

  try {
    const prompt = `
      Translate the following text: "${text}"
      Target Languages: ${target_languages.join(", ")}
      Style/Vibe: ${style} (Make it distinct!)

      Return JSON format: { "results": [ { "language": "Spanish", "translation": "...", "reality_check": "Literal meaning..." } ] }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a professional translator engine." }, { role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content);

    // --- NEW: Save to History ---
    if (userId) {
        const historyRecords = data.results.map(item => ({
            user_id: userId,
            original_text: text,
            translated_text: item.translation,
            language: item.language,
            style: style
        }));

        const { error } = await supabase.from('translations').insert(historyRecords);
        if (error) console.error("Failed to save history:", error);
    }
    // ----------------------------

    res.status(200).json(data);

  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
}