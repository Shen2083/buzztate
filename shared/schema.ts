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
