import { z } from "zod";

export const translationStyles = [
  "Modern Slang",
  "Professional", 
  "Romantic",
  "Angry New Yorker",
  "Gen Z"
] as const;

export const targetLanguages = [
  "Spanish",
  "French", 
  "German",
  "Japanese",
  "Portuguese"
] as const;

export type TranslationStyle = typeof translationStyles[number];
export type TargetLanguage = typeof targetLanguages[number];

export const translateRequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
  target_languages: z.array(z.enum(targetLanguages)).min(1, "Select at least one language"),
  style: z.enum(translationStyles)
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export interface TranslationResult {
  language: string;
  translation: string;
  reality_check: string;
}

export interface TranslateResponse {
  results: TranslationResult[];
}
