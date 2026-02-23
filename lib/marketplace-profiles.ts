export interface MarketplaceProfile {
  id: string;
  name: string;
  titleMaxChars: number;
  descriptionMaxChars: number;
  bulletPointMaxChars: number;
  bulletPointCount: number;
  keywordMaxChars: number;
  locale: string;
  searchBehaviorNotes: string;
  formattingRules: string[];
}

export const MARKETPLACE_PROFILES: Record<string, MarketplaceProfile> = {
  amazon_de: {
    id: "amazon_de",
    name: "Amazon Germany",
    titleMaxChars: 200,
    descriptionMaxChars: 2000,
    bulletPointMaxChars: 500,
    bulletPointCount: 5,
    keywordMaxChars: 250,
    locale: "de-DE",
    searchBehaviorNotes:
      "German shoppers search with compound words (e.g., 'Kaffeemaschine' not 'Kaffee Maschine'). Include umlauts in keywords. Germans value detailed technical specifications and certifications (TÜV, CE). Price sensitivity is high — emphasize value.",
    formattingRules: [
      "Use formal 'Sie' address, never informal 'du'",
      "Include metric measurements (cm, kg) — never imperial",
      "Reference EU/German certifications where applicable",
      "Compound nouns should be single words per German grammar",
    ],
  },
  amazon_fr: {
    id: "amazon_fr",
    name: "Amazon France",
    titleMaxChars: 200,
    descriptionMaxChars: 2000,
    bulletPointMaxChars: 500,
    bulletPointCount: 5,
    keywordMaxChars: 250,
    locale: "fr-FR",
    searchBehaviorNotes:
      "French shoppers often search with accented characters. Include both accented and non-accented keyword variants. Brand prestige and aesthetics matter — descriptions should feel elegant, not purely functional.",
    formattingRules: [
      "Use 'vous' (formal) address",
      "Include accented characters properly (é, è, ê, ë, à, ç)",
      "Metric measurements only",
      "French-style number formatting (1.000,00 not 1,000.00)",
    ],
  },
  amazon_es: {
    id: "amazon_es",
    name: "Amazon Spain",
    titleMaxChars: 200,
    descriptionMaxChars: 2000,
    bulletPointMaxChars: 500,
    bulletPointCount: 5,
    keywordMaxChars: 250,
    locale: "es-ES",
    searchBehaviorNotes:
      "Use European Spanish, not Latin American. Include ñ in keywords. Spanish shoppers respond well to emotional, benefit-driven copy rather than pure specs.",
    formattingRules: [
      "European Spanish (not Latin American variants)",
      "Use 'usted' form for formal product copy",
      "Metric measurements",
      "Spanish number formatting (1.000,00)",
    ],
  },
  amazon_it: {
    id: "amazon_it",
    name: "Amazon Italy",
    titleMaxChars: 200,
    descriptionMaxChars: 2000,
    bulletPointMaxChars: 500,
    bulletPointCount: 5,
    keywordMaxChars: 250,
    locale: "it-IT",
    searchBehaviorNotes:
      "Italian shoppers appreciate lifestyle-oriented descriptions. 'Made in Italy' carries weight if applicable. Design and aesthetics are major purchase drivers.",
    formattingRules: [
      "Use 'Lei' (formal) address in product copy",
      "Metric measurements",
      "Italian number formatting (1.000,00)",
      "Emphasize design, craftsmanship, and quality of materials",
    ],
  },
  amazon_jp: {
    id: "amazon_jp",
    name: "Amazon Japan",
    titleMaxChars: 500,
    descriptionMaxChars: 5000,
    bulletPointMaxChars: 500,
    bulletPointCount: 5,
    keywordMaxChars: 500,
    locale: "ja-JP",
    searchBehaviorNotes:
      "Japanese listings tend to be MUCH more detailed than Western ones. Include katakana for foreign brand names. Shoppers expect exhaustive specifications and usage scenarios. Polite, humble tone is essential.",
    formattingRules: [
      "Use keigo (polite/formal Japanese)",
      "Brand names in katakana",
      "Detailed specifications are expected (more is more)",
      "Include size in cm, weight in g/kg",
      "Add usage scenarios — Japanese shoppers want to visualize using the product",
    ],
  },
  shopify_international: {
    id: "shopify_international",
    name: "Shopify (Multi-market)",
    titleMaxChars: 255,
    descriptionMaxChars: 5000,
    bulletPointMaxChars: 0,
    bulletPointCount: 0,
    keywordMaxChars: 0,
    locale: "varies",
    searchBehaviorNotes:
      "Shopify SEO is Google-driven, not marketplace-driven. Optimize for Google search in each target language. Meta descriptions should be 150-160 chars. Include natural-language long-tail keywords.",
    formattingRules: [
      "HTML formatting allowed in descriptions",
      "SEO meta title: 50-60 chars",
      "SEO meta description: 150-160 chars",
      "Include structured data-friendly content",
    ],
  },
  etsy_international: {
    id: "etsy_international",
    name: "Etsy (International)",
    titleMaxChars: 140,
    descriptionMaxChars: 10000,
    bulletPointMaxChars: 0,
    bulletPointCount: 0,
    keywordMaxChars: 20,
    locale: "varies",
    searchBehaviorNotes:
      "Etsy search is tag-driven. Generate 13 tags per listing in the target language. Tags should be multi-word phrases, not single words. Etsy descriptions should tell a story — handmade/artisan feel.",
    formattingRules: [
      "13 tags maximum, each under 20 characters",
      "Tags should be multi-word phrases",
      "Description tone: warm, personal, artisan",
      "Include materials, dimensions, care instructions in target language",
    ],
  },
};

/** All marketplace IDs for use in UI dropdowns and validation */
export const MARKETPLACE_IDS = Object.keys(MARKETPLACE_PROFILES) as MarketplaceId[];

export type MarketplaceId = keyof typeof MARKETPLACE_PROFILES;

/** Fields that must NEVER be translated (Amazon flat file specific) */
export const DO_NOT_TRANSLATE_FIELDS = [
  "brand",
  "manufacturer",
  "sku",
  "asin",
  "upc",
  "ean",
  "recommended_browse_nodes",
  "item_type",
  "parent_sku",
  "parent_child",
  "variation_theme",
] as const;

/**
 * Amazon flat file column name → internal field mapping.
 * Used for auto-detecting columns in uploaded files.
 */
export const AMAZON_COLUMN_MAP: Record<string, string> = {
  item_name: "title",
  product_description: "description",
  bullet_point1: "bulletPoints.0",
  bullet_point2: "bulletPoints.1",
  bullet_point3: "bulletPoints.2",
  bullet_point4: "bulletPoints.3",
  bullet_point5: "bulletPoints.4",
  generic_keyword: "keywords",
};

/**
 * Shopify CSV column name → internal field mapping.
 */
export const SHOPIFY_COLUMN_MAP: Record<string, string> = {
  Title: "title",
  "Body (HTML)": "description",
  Tags: "keywords",
  "SEO Title": "seoMetaTitle",
  "SEO Description": "seoMetaDescription",
};

/**
 * Etsy CSV column name → internal field mapping.
 */
export const ETSY_COLUMN_MAP: Record<string, string> = {
  Title: "title",
  Description: "description",
  Tags: "keywords",
};
