import type { MarketplaceProfile } from "./marketplace-profiles";
import type { ParsedListing } from "../shared/schema";

/**
 * Builds a marketplace-aware localization prompt for GPT-4o-mini.
 * This is NOT a generic translator — it produces copy that sells on the target marketplace.
 */
export function buildLocalizationPrompt(
  marketplace: MarketplaceProfile,
  productData: ParsedListing,
  targetLanguage: string
): string {
  const bulletSection =
    marketplace.bulletPointCount > 0
      ? `- Bullet points: exactly ${marketplace.bulletPointCount} bullets, max ${marketplace.bulletPointMaxChars} chars each. Bullet points are the highest-conversion field on Amazon — localize them with the same care as titles.`
      : "";

  const keywordSection =
    marketplace.keywordMaxChars > 0
      ? `- Keywords/Tags: max ${marketplace.keywordMaxChars} characters`
      : "";

  // Always format bullet points, padding to 5 for Amazon
  const bulletCount = marketplace.bulletPointCount || 5;
  const paddedBullets = Array.from(
    { length: bulletCount },
    (_, i) => productData.bulletPoints?.[i] || ""
  );
  const originalBullets =
    marketplace.bulletPointCount > 0
      ? `Bullet Points:\n${paddedBullets.map((b, i) => `${i + 1}. ${b || "(empty — generate a relevant bullet point based on the title and description)"}`).join("\n")}`
      : "";

  const originalKeywords = productData.keywords
    ? `Keywords: ${productData.keywords}`
    : "";

  // Build the JSON schema example with the right number of bullet points
  const bulletPointsSchema =
    marketplace.bulletPointCount > 0
      ? `"bullet_points": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],`
      : "";

  return `You are an expert e-commerce listing localizer. Your task is to localize a product listing for ${marketplace.name} in ${targetLanguage}.

IMPORTANT: You are NOT just translating. You are creating a listing that will SELL on ${marketplace.name}. This means:

1. KEYWORD OPTIMIZATION: ${marketplace.searchBehaviorNotes}

2. CHARACTER LIMITS (strictly enforced):
   - Title: max ${marketplace.titleMaxChars} characters
   - Description: max ${marketplace.descriptionMaxChars} characters
   ${bulletSection}
   ${keywordSection}

3. FORMATTING RULES:
${marketplace.formattingRules.map((r) => `   - ${r}`).join("\n")}

4. CULTURAL LOCALIZATION:
   - Adapt benefits to resonate with local shoppers
   - Use locally relevant social proof language
   - Convert any measurements to local standards
   - Adapt tone to local shopping culture

5. COMPLETE TRANSLATION:
   - Translate ALL English words to ${targetLanguage}. Do not leave any English words untranslated.
   - The ONLY exceptions are universally recognized technical terms and proper brand names (see keyword rules below).
   - If unsure whether a term should stay in English, translate it.

6. KEYWORD LOCALIZATION RULES:
   - Keep these terms in English even in ${targetLanguage} output, as shoppers search for them this way: Hot Yoga, Bikram, Business (as in Business-Laptop), Indoor, Smart, Premium, Pro, LED, OLED, USB, Wi-Fi, SSD, Thunderbolt, Memory Foam
   - Always translate these terms to ${targetLanguage} (never leave in English): Grinder → Mahlwerk, Countertop → Arbeitsplatte/Küchenarbeitsplatte, Home → Heim/Zuhause, Self-watering → Selbstbewässernd, Non-slip → Rutschfest, Waterproof → Wasserdicht, Machine-washable → Maschinenwaschbar
   - For compound search terms, include BOTH the compound form and the separated form in keywords. Example: include both 'Espressomaschine' and 'Espresso Maschine', both 'Hundebett' and 'Hunde Bett'. German Amazon search matches both but ranks compound words higher.

${marketplace.bulletPointCount > 0 ? `7. BULLET POINTS:
   - You MUST return exactly ${marketplace.bulletPointCount} bullet points in the "bullet_points" array.
   - Each bullet point must be a complete, persuasive selling point in ${targetLanguage}.
   - If the original has fewer than ${marketplace.bulletPointCount} bullet points, create additional ones based on the product title and description.
   - Never return an empty array or fewer than ${marketplace.bulletPointCount} bullet points.` : ""}

ORIGINAL LISTING:
Title: ${productData.title}
Description: ${productData.description}
${originalBullets}
${originalKeywords}

Respond ONLY with a JSON object:
{
  "title": "localized title",
  "description": "localized description",
  ${bulletPointsSchema}
  "keywords": "localized keywords",
  "seo_meta_title": "if applicable",
  "seo_meta_description": "if applicable"
}`;
}

/**
 * Builds the system message for the localization chat completion.
 */
export function buildSystemMessage(marketplace: MarketplaceProfile): string {
  return `You are an expert e-commerce product listing localizer specializing in ${marketplace.name}. You understand the marketplace's search algorithm, cultural buying patterns, and listing best practices. You produce localized listings that maximize conversions, not literal translations. Always respect character limits strictly. CRITICAL: Every word must be in the target language — never leave English words untranslated unless they are universally recognized technical abbreviations (USB, OLED, Wi-Fi, LED, etc.) or proper brand names. You MUST always return bullet_points as an array of exactly ${marketplace.bulletPointCount} strings when the marketplace supports bullet points. Respond only with valid JSON.`;
}
