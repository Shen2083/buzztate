import OpenAI from 'openai';

// Initialize OpenAI with your Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, target_languages, style } = req.body;

    const systemPrompt = `
      You are 'Buzztate', a witty translation engine.
      1. Translate the input text into these languages: ${target_languages.join(", ")}.
      2. Apply this style: "${style}".
      3. Provide a 'reality_check': a literal back-translation into English.
      4. Return JSON only:
      {
        "results": [
          { "language": "Language Name", "translation": "Translated Text", "reality_check": "Literal Meaning" }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content);
    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Translation failed", details: error.message });
  }
}