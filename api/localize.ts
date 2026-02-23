import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { localizeRequestSchema } from "../shared/schema";
import type {
  ParsedListing,
  LocalizedListing,
  LocalizationResultItem,
  QualityFlag,
} from "../shared/schema";
import { MARKETPLACE_PROFILES } from "../lib/marketplace-profiles";
import {
  buildLocalizationPrompt,
  buildSystemMessage,
} from "../lib/localization-prompt";
import { checkListingQuality } from "../lib/quality-checker";
import { verifyAuth } from "./_lib/auth";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** How many listings to send to OpenAI per batch (to avoid timeouts) */
const BATCH_SIZE = 5;

/** Free tier: 5 listings/month, 2 languages */
const FREE_LISTING_LIMIT = 5;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Validate request body
  const parseResult = localizeRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  const { listings, marketplace, targetLanguage } = parseResult.data;

  // Auth (optional — free tier allowed without account)
  const { userId: authUserId } = await verifyAuth(req);
  const userId = authUserId || parseResult.data.userId;

  // Look up marketplace profile
  const profile = MARKETPLACE_PROFILES[marketplace];
  if (!profile) {
    return res.status(400).json({ error: `Unknown marketplace: ${marketplace}` });
  }

  try {
    // Enforce free tier limits
    if (!userId) {
      if (listings.length > FREE_LISTING_LIMIT) {
        return res.status(403).json({
          error: `Free tier is limited to ${FREE_LISTING_LIMIT} listings. Sign up for more.`,
        });
      }
    } else {
      // Check pro status for future tier enforcement
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", userId)
        .single();

      if (!userProfile?.is_pro && listings.length > FREE_LISTING_LIMIT) {
        return res.status(403).json({
          error: `Free plan is limited to ${FREE_LISTING_LIMIT} listings per request. Upgrade for more.`,
        });
      }
    }

    // Process listings in batches
    const allResults: LocalizationResultItem[] = [];

    for (let i = 0; i < listings.length; i += BATCH_SIZE) {
      const batch = listings.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((listing, batchIndex) =>
          localizeSingleListing(
            listing as ParsedListing,
            profile,
            targetLanguage,
            i + batchIndex
          )
        )
      );
      allResults.push(...batchResults);
    }

    // Save localization job to history if authenticated
    if (userId) {
      await supabase.from("translations").insert(
        allResults.map((r) => ({
          user_id: userId,
          original_text: r.original.title,
          translated_text: r.localized.title,
          language: targetLanguage,
          style: `localize:${marketplace}`,
        }))
      );
    }

    return res.status(200).json({
      results: allResults,
      marketplace,
      targetLanguage,
    });
  } catch (error: any) {
    console.error("Localization error:", error);
    return res.status(500).json({
      error: "Localization failed. Please try again.",
    });
  }
}

/**
 * Localize a single listing via OpenAI.
 */
async function localizeSingleListing(
  listing: ParsedListing,
  marketplace: typeof MARKETPLACE_PROFILES[string],
  targetLanguage: string,
  index: number
): Promise<LocalizationResultItem> {
  const userPrompt = buildLocalizationPrompt(marketplace, listing, targetLanguage);
  const systemMsg = buildSystemMessage(marketplace);

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemMsg },
      { role: "user", content: userPrompt },
    ],
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content || "{}";
  let localized: LocalizedListing;

  try {
    localized = JSON.parse(raw);
  } catch {
    localized = {
      title: "",
      description: "",
    };
  }

  // Ensure required fields exist
  if (!localized.title) localized.title = "";
  if (!localized.description) localized.description = "";

  // Run quality checks
  const qualityFlags = checkListingQuality(localized, marketplace, listing);

  return {
    sourceRow: listing.sourceRow ?? index,
    original: listing,
    localized,
    qualityFlags,
  };
}
