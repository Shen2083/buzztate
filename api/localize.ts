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

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Supabase admin credentials are not configured');
  return createClient(url, serviceKey);
}

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  return new OpenAI({ apiKey });
}

/** How many listings to send to OpenAI per batch (to avoid timeouts) */
const BATCH_SIZE = 5;

/** Tier limits: listings per month */
const TIER_LIMITS: Record<string, { listingsPerMonth: number; maxPerRequest: number }> = {
  free:    { listingsPerMonth: 5,         maxPerRequest: 5 },
  starter: { listingsPerMonth: 100,       maxPerRequest: 50 },
  growth:  { listingsPerMonth: 500,       maxPerRequest: 100 },
  scale:   { listingsPerMonth: Infinity,  maxPerRequest: 100 },
};

export default async function handler(req: any, res: any) {
  try {
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

    const supabase = getSupabaseAdmin();
    const openai = getOpenAI();
    // Determine tier and enforce limits
    let planTier = "free";
    let listingsUsed = 0;

    if (userId) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("plan_tier, listings_used_this_month, listings_reset_date")
        .eq("id", userId)
        .single();

      if (userProfile) {
        planTier = userProfile.plan_tier || "free";

        // Check if we need to reset the monthly counter
        const resetDate = new Date(userProfile.listings_reset_date || 0);
        const now = new Date();
        const monthsSinceReset =
          (now.getFullYear() - resetDate.getFullYear()) * 12 +
          (now.getMonth() - resetDate.getMonth());

        if (monthsSinceReset >= 1) {
          // Reset counter for new billing period
          listingsUsed = 0;
          await supabase
            .from("profiles")
            .update({
              listings_used_this_month: 0,
              listings_reset_date: now.toISOString(),
            })
            .eq("id", userId);
        } else {
          listingsUsed = userProfile.listings_used_this_month || 0;
        }
      }
    }

    const tierConfig = TIER_LIMITS[planTier] || TIER_LIMITS.free;

    // Check per-request limit
    if (listings.length > tierConfig.maxPerRequest) {
      return res.status(403).json({
        error: `Your ${planTier} plan allows max ${tierConfig.maxPerRequest} listings per request. You sent ${listings.length}.`,
      });
    }

    // Check monthly limit
    const remaining = tierConfig.listingsPerMonth - listingsUsed;
    if (listings.length > remaining) {
      return res.status(403).json({
        error: `Monthly limit reached. Your ${planTier} plan allows ${tierConfig.listingsPerMonth} listings/month. Used: ${listingsUsed}, remaining: ${remaining}.`,
        upgrade: true,
      });
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
            i + batchIndex,
            openai
          )
        )
      );
      allResults.push(...batchResults);
    }

    // Update usage counter and save job history if authenticated
    if (userId) {
      // Increment usage
      await supabase
        .from("profiles")
        .update({
          listings_used_this_month: listingsUsed + listings.length,
        })
        .eq("id", userId);

      // Save localization job
      const { data: job } = await supabase
        .from("localization_jobs")
        .insert({
          user_id: userId,
          marketplace,
          target_language: targetLanguage,
          listing_count: listings.length,
          status: "completed",
        })
        .select("id")
        .single();

      // Save individual listing results
      if (job) {
        await supabase.from("localized_listings").insert(
          allResults.map((r) => ({
            job_id: job.id,
            original_data: r.original,
            localized_data: r.localized,
            quality_flags: r.qualityFlags,
          }))
        );
      }

      // Also save to translations table for legacy history view
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
      usage: {
        used: listingsUsed + listings.length,
        limit: tierConfig.listingsPerMonth,
        plan: planTier,
      },
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
  index: number,
  openai: OpenAI
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
