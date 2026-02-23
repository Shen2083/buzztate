import { z } from "zod";

export const translationStyles = [
  "Modern Slang",
  "Professional",
  "Professional / Corporate",
  "Romantic",
  "Romantic Poet",
  "Angry New Yorker",
  "Gen Z",
  "Gen Z Influencer",
  "App Store Description",
  "Marketing Copy"
] as const;

export const targetLanguages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Italian",
  "Portuguese",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Chinese",
  "Korean",
  "Russian",
  "Arabic",
  "Hindi",
  "Dutch",
  "Turkish",
  "Polish",
  "Swedish",
  "Danish",
  "Norwegian",
  "Finnish",
  "Greek",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Indonesian",
  "Malay",
  "Czech",
  "Hungarian",
  "Romanian",
  "Ukrainian"
] as const;

export type TranslationStyle = typeof translationStyles[number];
export type TargetLanguage = typeof targetLanguages[number];

export const translateRequestSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000, "Text too long (max 5000 characters)"),
  target_languages: z.array(z.string()).min(1, "Select at least one language").max(50, "Too many languages"),
  style: z.string().min(1, "Style is required"),
  userId: z.string().uuid().optional()
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export const verifyPaymentRequestSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required")
});

export type VerifyPaymentRequest = z.infer<typeof verifyPaymentRequestSchema>;

export interface TranslationResult {
  language: string;
  translation: string;
  reality_check: string;
}

export interface TranslateResponse {
  results: TranslationResult[];
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// E-Commerce Listing Localizer types
// ---------------------------------------------------------------------------

/** A single parsed product listing from a CSV/Excel upload */
export interface ParsedListing {
  title: string;
  description: string;
  bulletPoints?: string[];
  keywords?: string;
  price?: string;
  category?: string;
  /** Row index from the original file (for mapping back on export) */
  sourceRow?: number;
  /** Any extra columns the user chose not to map — preserved for export */
  extraFields?: Record<string, string>;
}

/** Result of localizing a single listing */
export interface LocalizedListing {
  title: string;
  description: string;
  bullet_points?: string[];
  keywords?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
}

/** Quality flag for a single field in a localized listing */
export interface QualityFlag {
  field: string;
  issue: "exceeded_limit" | "empty" | "suspiciously_short";
  detail: string;
}

/** Result for one listing including quality info */
export interface LocalizationResultItem {
  sourceRow: number;
  original: ParsedListing;
  localized: LocalizedListing;
  qualityFlags: QualityFlag[];
}

/** Full response from the /api/localize endpoint */
export interface LocalizeResponse {
  results: LocalizationResultItem[];
  marketplace: string;
  targetLanguage: string;
}

/** Column mapping entry — which source column maps to which internal field */
export interface ColumnMapping {
  sourceColumn: string;
  targetField: string; // e.g. "title", "description", "bulletPoints.0", "doNotTranslate", "ignore"
}

/** Supported internal field targets for column mapping */
export const MAPPING_TARGETS = [
  "title",
  "description",
  "bulletPoints.0",
  "bulletPoints.1",
  "bulletPoints.2",
  "bulletPoints.3",
  "bulletPoints.4",
  "keywords",
  "price",
  "category",
  "doNotTranslate",
  "ignore",
] as const;

export type MappingTarget = typeof MAPPING_TARGETS[number];

/** Marketplace IDs matching the keys in MARKETPLACE_PROFILES */
export const marketplaceIds = [
  "amazon_de",
  "amazon_fr",
  "amazon_es",
  "amazon_it",
  "amazon_jp",
  "shopify_international",
  "etsy_international",
] as const;

export type MarketplaceId = typeof marketplaceIds[number];

/** Zod schema for the /api/localize request body */
export const localizeRequestSchema = z.object({
  listings: z.array(z.object({
    title: z.string().min(1),
    description: z.string().default(""),
    bulletPoints: z.array(z.string()).optional(),
    keywords: z.string().optional(),
    price: z.string().optional(),
    category: z.string().optional(),
    sourceRow: z.number().optional(),
    extraFields: z.record(z.string()).optional(),
  })).min(1, "At least one listing is required").max(100, "Max 100 listings per request"),
  marketplace: z.enum(marketplaceIds),
  targetLanguage: z.string().min(1, "Target language is required"),
  userId: z.string().uuid().optional(),
});

export type LocalizeRequest = z.infer<typeof localizeRequestSchema>;

// Legacy types for unused storage module (boilerplate)
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}
