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
      ? `- Bullet points: ${marketplace.bulletPointCount} bullets, max ${marketplace.bulletPointMaxChars} chars each`
      : "";

  const keywordSection =
    marketplace.keywordMaxChars > 0
      ? `- Keywords/Tags: max ${marketplace.keywordMaxChars} characters`
      : "";

  const originalBullets =
    productData.bulletPoints?.length
      ? `Bullet Points:\n${productData.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join("\n")}`
      : "";

  const originalKeywords = productData.keywords
    ? `Keywords: ${productData.keywords}`
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

ORIGINAL LISTING:
Title: ${productData.title}
Description: ${productData.description}
${originalBullets}
${originalKeywords}

Respond ONLY with a JSON object:
{
  "title": "localized title",
  "description": "localized description",
  "bullet_points": ["point1", "point2", ...],
  "keywords": "localized keywords",
  "seo_meta_title": "if applicable",
  "seo_meta_description": "if applicable"
}`;
}

/**
 * Builds the system message for the localization chat completion.
 */
export function buildSystemMessage(marketplace: MarketplaceProfile): string {
  return `You are an expert e-commerce product listing localizer specializing in ${marketplace.name}. You understand the marketplace's search algorithm, cultural buying patterns, and listing best practices. You produce localized listings that maximize conversions, not literal translations. Always respect character limits strictly. Respond only with valid JSON.`;
}
