import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { localizeRequestSchema } from "../shared/schema.js";
import type {
  ParsedListing,
  LocalizedListing,
  LocalizationResultItem,
  QualityFlag,
} from "../shared/schema.js";
import { MARKETPLACE_PROFILES } from "../lib/marketplace-profiles.js";
import {
  buildLocalizationPrompt,
  buildSystemMessage,
} from "../lib/localization-prompt.js";
import { checkListingQuality } from "../lib/quality-checker.js";
import { verifyAuth } from "./_lib/auth.js";

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

/** Tier limits */
const TIER_LIMITS: Record<string, { localizationsPerMonth: number }> = {
  free: { localizationsPerMonth: 5 },
  plus: { localizationsPerMonth: Infinity },
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Validate request body (single listing)
    const parseResult = localizeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { listing, marketplace, targetLanguage } = parseResult.data;

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

    // Free tier: enforce monthly cap
    if (planTier === "free" && listingsUsed >= tierConfig.localizationsPerMonth) {
      return res.status(403).json({
        error: `Monthly limit reached. Your Free plan allows ${tierConfig.localizationsPerMonth} localizations/month. Used: ${listingsUsed}.`,
        upgrade: true,
      });
    }

    // Process single listing
    const result = await localizeSingleListing(
      listing as ParsedListing,
      profile,
      targetLanguage,
      listing.sourceRow || 0,
      openai
    );

    // Increment usage counter
    // Note: small race condition with concurrent requests — acceptable for MVP
    if (userId) {
      await supabase
        .from("profiles")
        .update({
          listings_used_this_month: listingsUsed + 1,
        })
        .eq("id", userId);
    }

    return res.status(200).json({
      result,
      marketplace,
      targetLanguage,
      usage: {
        used: listingsUsed + 1,
        limit: tierConfig.localizationsPerMonth,
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
const OPENAI_MAX_RETRIES = 2;
const OPENAI_TIMEOUT_MS = 30_000;

async function localizeSingleListing(
  listing: ParsedListing,
  marketplace: typeof MARKETPLACE_PROFILES[string],
  targetLanguage: string,
  index: number,
  openai: OpenAI
): Promise<LocalizationResultItem> {
  const userPrompt = buildLocalizationPrompt(marketplace, listing, targetLanguage);
  const systemMsg = buildSystemMessage(marketplace);

  let localized: LocalizedListing = { title: "", description: "" };
  const qualityFlagsExtra: QualityFlag[] = [];

  for (let attempt = 0; attempt <= OPENAI_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

      const completion = await openai.chat.completions.create(
        {
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: userPrompt },
          ],
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
        },
        { signal: controller.signal as any }
      );

      clearTimeout(timeout);

      const raw = completion.choices[0].message.content || "{}";

      try {
        localized = JSON.parse(raw);
      } catch {
        localized = { title: "", description: "" };
      }

      break;
    } catch (err: any) {
      const isRateLimit = err?.status === 429;
      const isTimeout = err?.name === "AbortError" || err?.code === "ETIMEDOUT";
      const isContentFilter = err?.code === "content_filter";

      if (isContentFilter) {
        qualityFlagsExtra.push({
          field: "title",
          issue: "content_filter",
          detail: "This listing couldn't be localized due to content restrictions. Please review the original text.",
        });
        break;
      }

      if ((isRateLimit || isTimeout) && attempt < OPENAI_MAX_RETRIES) {
        await new Promise(r => setTimeout(r, isRateLimit ? 2000 : 1000));
        continue;
      }

      console.error(`OpenAI error for listing ${index} (attempt ${attempt + 1}):`, err?.message || err);
      if (attempt === OPENAI_MAX_RETRIES) {
        qualityFlagsExtra.push({
          field: "title",
          issue: "api_error",
          detail: "This listing could not be localized. Please retry.",
        });
      }
      break;
    }
  }

  // Ensure required fields exist
  if (!localized.title) localized.title = "";
  if (!localized.description) localized.description = "";

  // Pad bullet_points to exactly the marketplace count (e.g. 5 for Amazon)
  if (marketplace.bulletPointCount > 0) {
    const bullets = localized.bullet_points || [];
    localized.bullet_points = Array.from(
      { length: marketplace.bulletPointCount },
      (_, i) => bullets[i] || ""
    );
  }

  // Run quality checks
  const qualityFlags = [
    ...checkListingQuality(localized, marketplace, listing),
    ...qualityFlagsExtra,
  ];

  return {
    sourceRow: listing.sourceRow ?? index,
    original: listing,
    localized,
    qualityFlags,
  };
}
