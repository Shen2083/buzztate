import type { LocalizedListing, QualityFlag, ParsedListing } from "../shared/schema";
import type { MarketplaceProfile } from "./marketplace-profiles";

/**
 * Check a localized listing against marketplace rules and flag issues.
 */
export function checkListingQuality(
  localized: LocalizedListing,
  marketplace: MarketplaceProfile,
  original: ParsedListing
): QualityFlag[] {
  const flags: QualityFlag[] = [];

  // Title checks
  checkField(flags, "title", localized.title, marketplace.titleMaxChars, original.title);

  // Description checks
  checkField(
    flags,
    "description",
    localized.description,
    marketplace.descriptionMaxChars,
    original.description
  );

  // Bullet point checks
  if (marketplace.bulletPointCount > 0 && localized.bullet_points) {
    for (let i = 0; i < localized.bullet_points.length; i++) {
      checkField(
        flags,
        `bullet_points[${i}]`,
        localized.bullet_points[i],
        marketplace.bulletPointMaxChars,
        original.bulletPoints?.[i]
      );
    }

    // Check if we got fewer bullet points than expected
    if (
      localized.bullet_points.length < marketplace.bulletPointCount &&
      original.bulletPoints &&
      original.bulletPoints.length >= marketplace.bulletPointCount
    ) {
      flags.push({
        field: "bullet_points",
        issue: "suspiciously_short",
        detail: `Expected ${marketplace.bulletPointCount} bullet points but got ${localized.bullet_points.length}`,
      });
    }
  }

  // Keyword checks
  if (marketplace.keywordMaxChars > 0 && localized.keywords) {
    checkField(
      flags,
      "keywords",
      localized.keywords,
      marketplace.keywordMaxChars,
      original.keywords
    );
  }

  // SEO checks for Shopify
  if (marketplace.id === "shopify_international") {
    if (localized.seo_meta_title && localized.seo_meta_title.length > 60) {
      flags.push({
        field: "seo_meta_title",
        issue: "exceeded_limit",
        detail: `SEO title is ${localized.seo_meta_title.length} chars (max 60)`,
      });
    }
    if (localized.seo_meta_description && localized.seo_meta_description.length > 160) {
      flags.push({
        field: "seo_meta_description",
        issue: "exceeded_limit",
        detail: `SEO description is ${localized.seo_meta_description.length} chars (max 160)`,
      });
    }
  }

  return flags;
}

/**
 * Check a single field for quality issues.
 */
function checkField(
  flags: QualityFlag[],
  fieldName: string,
  value: string | undefined,
  maxChars: number,
  originalValue?: string
): void {
  // Empty check
  if (!value || value.trim().length === 0) {
    flags.push({
      field: fieldName,
      issue: "empty",
      detail: `${fieldName} is empty`,
    });
    return;
  }

  // Character limit check
  if (maxChars > 0 && value.length > maxChars) {
    flags.push({
      field: fieldName,
      issue: "exceeded_limit",
      detail: `${value.length} chars (max ${maxChars})`,
    });
  }

  // Suspiciously short check (less than 10% of original)
  if (originalValue && originalValue.length > 20) {
    const ratio = value.length / originalValue.length;
    if (ratio < 0.1) {
      flags.push({
        field: fieldName,
        issue: "suspiciously_short",
        detail: `Output is only ${Math.round(ratio * 100)}% of original length`,
      });
    }
  }
}
