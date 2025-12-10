import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { translateRequestSchema, type TranslationResult } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function generateMockTranslations(
  text: string, 
  languages: string[], 
  style: string
): TranslationResult[] {
  const mockTranslations: Record<string, Record<string, { translation: string; reality_check: string }>> = {
    Spanish: {
      "Modern Slang": { 
        translation: "Eso está muy cool, no cap. La vibra es totalmente real, bro.",
        reality_check: "That's very cool, no lie. The vibe is totally real, bro."
      },
      "Professional": {
        translation: "Le informamos respetuosamente que su solicitud ha sido procesada con éxito.",
        reality_check: "We respectfully inform you that your request has been processed successfully."
      },
      "Romantic": {
        translation: "Mi corazón late solo por ti, mi amor eterno bajo las estrellas.",
        reality_check: "My heart beats only for you, my eternal love under the stars."
      },
      "Angry New Yorker": {
        translation: "¡Oye! ¿Qué te pasa? ¡Muévete, tengo prisa aquí!",
        reality_check: "Hey! What's wrong with you? Move it, I'm in a hurry here!"
      },
      "Gen Z": {
        translation: "Literal no puedo, esto es tan slay. Estoy muerto, sin cap fr fr.",
        reality_check: "I literally can't, this is so slay. I'm dead, no lie for real for real."
      }
    },
    French: {
      "Modern Slang": {
        translation: "C'est trop stylé, grave de ouf. La vibe est réelle, frère.",
        reality_check: "It's too stylish, really crazy. The vibe is real, brother."
      },
      "Professional": {
        translation: "Nous avons le plaisir de vous informer que votre demande a été traitée.",
        reality_check: "We are pleased to inform you that your request has been processed."
      },
      "Romantic": {
        translation: "Mon cœur ne bat que pour toi, mon amour éternel sous les étoiles.",
        reality_check: "My heart beats only for you, my eternal love under the stars."
      },
      "Angry New Yorker": {
        translation: "Hé toi! Tu fais quoi là? Bouge-toi, j'ai pas que ça à faire!",
        reality_check: "Hey you! What are you doing there? Move it, I don't have all day!"
      },
      "Gen Z": {
        translation: "Genre, c'est trop iconic. Je suis mort, c'est la vraie vie là.",
        reality_check: "Like, it's too iconic. I'm dead, this is real life right here."
      }
    },
    German: {
      "Modern Slang": {
        translation: "Das ist mega krass, kein Fake. Die Vibes sind total echt, Bruder.",
        reality_check: "That's mega crazy, no fake. The vibes are totally real, brother."
      },
      "Professional": {
        translation: "Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Anfrage bearbeitet wurde.",
        reality_check: "We are pleased to inform you that your request has been processed."
      },
      "Romantic": {
        translation: "Mein Herz schlägt nur für dich, meine ewige Liebe unter den Sternen.",
        reality_check: "My heart beats only for you, my eternal love under the stars."
      },
      "Angry New Yorker": {
        translation: "Hey du! Was soll das? Beweg dich, ich hab's eilig hier!",
        reality_check: "Hey you! What's this about? Move it, I'm in a hurry here!"
      },
      "Gen Z": {
        translation: "Das ist so lit, ich kann nicht mehr. Null Cap, ist so real.",
        reality_check: "That's so lit, I can't anymore. Zero cap, it's so real."
      }
    },
    Japanese: {
      "Modern Slang": {
        translation: "マジでやばい、ガチで。バイブスがリアルすぎる、ブロ。",
        reality_check: "Seriously crazy, for real. The vibes are too real, bro."
      },
      "Professional": {
        translation: "お客様のご依頼は正常に処理されましたことをお知らせいたします。",
        reality_check: "We inform you that your request has been processed successfully."
      },
      "Romantic": {
        translation: "星空の下、永遠の愛を込めて、私の心はあなただけのもの。",
        reality_check: "Under the starry sky, with eternal love, my heart belongs only to you."
      },
      "Angry New Yorker": {
        translation: "おい！何やってんだ？早く動け、急いでんだよ！",
        reality_check: "Hey! What are you doing? Move quickly, I'm in a hurry!"
      },
      "Gen Z": {
        translation: "これマジで推せる。死んだわ、ガチでリアル。",
        reality_check: "This is seriously stan-worthy. I'm dead, really real."
      }
    },
    Portuguese: {
      "Modern Slang": {
        translation: "Isso tá muito sinistro, sem cap. A vibe é real demais, mano.",
        reality_check: "That's very sinister (cool), no cap. The vibe is too real, bro."
      },
      "Professional": {
        translation: "Temos o prazer de informar que sua solicitação foi processada com sucesso.",
        reality_check: "We are pleased to inform you that your request has been processed successfully."
      },
      "Romantic": {
        translation: "Meu coração bate só por você, meu amor eterno sob as estrelas.",
        reality_check: "My heart beats only for you, my eternal love under the stars."
      },
      "Angry New Yorker": {
        translation: "Ei você! Que que tá fazendo? Sai da frente, tô com pressa!",
        reality_check: "Hey you! What are you doing? Get out of the way, I'm in a hurry!"
      },
      "Gen Z": {
        translation: "Isso é muito paia... brincadeira, tá slay demais. Morri, sem cap.",
        reality_check: "This is very lame... just kidding, it's too slay. I died, no cap."
      }
    }
  };

  return languages.map(lang => ({
    language: lang,
    translation: mockTranslations[lang]?.[style]?.translation || `[${style}] ${text} (in ${lang})`,
    reality_check: mockTranslations[lang]?.[style]?.reality_check || `Literal back-translation of the ${lang} version`
  }));
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/translate", async (req, res) => {
    try {
      const parsed = translateRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: parsed.error.errors 
        });
      }

      const { text, target_languages, style } = parsed.data;

      if (!openai) {
        const mockResults = generateMockTranslations(text, target_languages, style);
        return res.json({ results: mockResults });
      }

      const systemPrompt = `Translate the text into the target languages using the specific style. Return a JSON object containing an array of results. Each result must have 'language', 'translation', and 'reality_check' (a literal English back-translation).

Style to use: ${style}
Target languages: ${target_languages.join(", ")}

Respond ONLY with valid JSON in this exact format:
{
  "results": [
    {
      "language": "LanguageName",
      "translation": "The translated text in that language with the specified style",
      "reality_check": "A literal English back-translation of the translation"
    }
  ]
}`;

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      // User specifically requested gpt-4o-mini in their requirements
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      const result = JSON.parse(content);
      return res.json(result);

    } catch (error) {
      console.error("Translation error:", error);
      return res.status(500).json({ 
        error: "Translation failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  return httpServer;
}
