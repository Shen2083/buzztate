import type { LocalizationResultItem, ParsedListing, LocalizedListing } from "../shared/schema";
import type { MarketplaceProfile } from "./marketplace-profiles";

// ---- Source platform detection ----

type SourcePlatform = "amazon" | "shopify" | "etsy" | "unknown";

function detectSourcePlatform(headers: string[]): SourcePlatform {
  const lower = new Set(headers.map(h => h.toLowerCase().trim()));
  if (lower.has("listing id") || lower.has("who made") || lower.has("when made")) return "etsy";
  if (lower.has("body (html)") || lower.has("handle") || lower.has("variant sku")) return "shopify";
  if (lower.has("item_name") || lower.has("bullet_point1") || lower.has("product_description")) return "amazon";
  return "unknown";
}

/** Case-insensitive lookup of a value in an original row */
function findValueCI(row: Record<string, string>, targetColumn: string): string | undefined {
  const lower = targetColumn.toLowerCase();
  for (const [key, val] of Object.entries(row)) {
    if (key.toLowerCase().trim() === lower) return val;
  }
  return undefined;
}

// ---- Escaping helpers ----

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function tsvEscape(value: string): string {
  if (value.includes("\t") || value.includes("\n") || value.includes("\r") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

// ---- Amazon column definitions ----

/** Translatable Amazon columns and how to populate them from localized results */
const AMAZON_TRANSLATABLE: Record<string, (r: LocalizationResultItem) => string> = {
  item_name: (r) => r.localized.title,
  product_description: (r) => r.localized.description,
  bullet_point1: (r) => r.localized.bullet_points?.[0] || "",
  bullet_point2: (r) => r.localized.bullet_points?.[1] || "",
  bullet_point3: (r) => r.localized.bullet_points?.[2] || "",
  bullet_point4: (r) => r.localized.bullet_points?.[3] || "",
  bullet_point5: (r) => r.localized.bullet_points?.[4] || "",
  generic_keyword: (r) => r.localized.keywords || "",
};

/** Canonical Amazon Seller Central columns for cross-platform export */
const AMAZON_STANDARD_COLUMNS = [
  "sku", "brand_name", "item_name", "product_description",
  "bullet_point1", "bullet_point2", "bullet_point3", "bullet_point4", "bullet_point5",
  "generic_keyword", "standard_price",
];

/** Map source platform columns → Amazon non-translatable columns (case-insensitive keys) */
const PASSTHROUGH_TO_AMAZON: Record<string, [string, string][]> = {
  etsy: [["sku", "sku"], ["price", "standard_price"]],
  shopify: [["variant sku", "sku"], ["variant price", "standard_price"], ["vendor", "brand_name"]],
  unknown: [],
};

// ---- Shopify column definitions ----

/** Shopify translatable columns and how to populate them */
const SHOPIFY_TRANSLATABLE: Record<string, (r: LocalizationResultItem) => string> = {
  "handle": (r) => slugify(r.localized.title || r.original.title),
  "title": (r) => r.localized.title,
  "body (html)": (r) => r.localized.description,
  "tags": (r) => r.localized.keywords || "",
  "seo title": (r) => r.localized.seo_meta_title || "",
  "seo description": (r) => r.localized.seo_meta_description || "",
};

/** Essential Shopify columns to ensure in output even if source doesn't have them */
const SHOPIFY_ESSENTIAL_COLUMNS = [
  "Handle", "Title", "Body (HTML)", "Tags", "SEO Title", "SEO Description",
];

// ---- Etsy column definitions ----

/** Etsy translatable columns */
const ETSY_TRANSLATABLE: Record<string, (r: LocalizationResultItem) => string> = {
  "title": (r) => r.localized.title,
  "description": (r) => r.localized.description,
  "tags": (r) => r.localized.keywords || "",
};

/** Essential Etsy columns to ensure in output even if source doesn't have them */
const ETSY_ESSENTIAL_COLUMNS = [
  "Title", "Description", "Tags",
];

// ==============================================================
// Export functions
// ==============================================================

/**
 * Generate a generic side-by-side CSV with original + localized columns.
 */
export function exportGenericCSV(
  results: LocalizationResultItem[],
  targetLanguage: string
): string {
  const BULLET_COUNT = 5;

  const headers = [
    "Row",
    "Original Title",
    `${targetLanguage} Title`,
    "Original Description",
    `${targetLanguage} Description`,
    ...Array.from({ length: BULLET_COUNT }, (_, i) => [
      `Original Bullet ${i + 1}`,
      `${targetLanguage} Bullet ${i + 1}`,
    ]).flat(),
    "Original Keywords",
    `${targetLanguage} Keywords`,
    "Quality Flags",
  ];

  const rows = results.map((r) => [
    String(r.sourceRow),
    csvEscape(r.original.title),
    csvEscape(r.localized.title),
    csvEscape(r.original.description),
    csvEscape(r.localized.description),
    ...Array.from({ length: BULLET_COUNT }, (_, i) => [
      csvEscape(r.original.bulletPoints?.[i] || ""),
      csvEscape(r.localized.bullet_points?.[i] || ""),
    ]).flat(),
    csvEscape(r.original.keywords || ""),
    csvEscape(r.localized.keywords || ""),
    csvEscape(
      r.qualityFlags.length > 0
        ? r.qualityFlags.map((f) => `${f.field}: ${f.detail}`).join("; ")
        : "OK"
    ),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generate an Amazon Seller Central flat file (tab-delimited).
 * Handles both same-platform and cross-platform exports.
 */
export function exportAmazonFlatFile(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[]
): string {
  if (results.length === 0) return "";

  const sourceHeaders = originalRows.length > 0 ? Object.keys(originalRows[0]) : [];
  const sourcePlatform = detectSourcePlatform(sourceHeaders);

  if (sourcePlatform === "amazon" && sourceHeaders.length > 0) {
    // Same-platform: preserve ALL original columns, replace translatable ones
    return exportSamePlatformTSV(results, originalRows, sourceHeaders, AMAZON_TRANSLATABLE);
  }

  // Cross-platform: generate Amazon format columns
  const headers = AMAZON_STANDARD_COLUMNS;
  const passthroughPairs = PASSTHROUGH_TO_AMAZON[sourcePlatform] || [];

  const rows = results.map((r) => {
    const originalRow = originalRows[r.sourceRow] || {};

    // Build passthrough lookup: amazonCol → value
    const passthrough: Record<string, string> = {};
    for (const [sourceCol, amazonCol] of passthroughPairs) {
      const val = findValueCI(originalRow, sourceCol);
      if (val !== undefined) passthrough[amazonCol] = val;
    }

    return headers.map((h) => {
      const getter = AMAZON_TRANSLATABLE[h];
      if (getter) return tsvEscape(getter(r));
      return tsvEscape(passthrough[h] || "");
    });
  });

  return [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
}

/**
 * Generate a Shopify-compatible CSV export.
 * Preserves ALL source columns unchanged, adds essential Shopify columns
 * if missing, and overwrites translatable fields with localized versions.
 */
export function exportShopifyCSV(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[]
): string {
  if (results.length === 0) return "";
  return exportWithColumnPreservation(results, originalRows, SHOPIFY_TRANSLATABLE, SHOPIFY_ESSENTIAL_COLUMNS);
}

/**
 * Generate an Etsy-compatible CSV export.
 * Preserves ALL source columns unchanged, adds essential Etsy columns
 * if missing, and overwrites translatable fields with localized versions.
 */
export function exportEtsyCSV(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[]
): string {
  if (results.length === 0) return "";
  return exportWithColumnPreservation(results, originalRows, ETSY_TRANSLATABLE, ETSY_ESSENTIAL_COLUMNS);
}

// ---- Shared helpers ----

/**
 * Unified CSV export that preserves ALL original columns, prepends any missing
 * essential columns, and overwrites translatable fields with localized data.
 * Works for both same-platform and cross-platform exports (Shopify, Etsy).
 */
function exportWithColumnPreservation(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[],
  translatableMap: Record<string, (r: LocalizationResultItem) => string>,
  essentialColumns: string[],
): string {
  // Start with ALL source headers from the original file
  const sourceHeaders = originalRows.length > 0 ? Object.keys(originalRows[0]) : [];

  // Build a case-insensitive set of existing headers for dedup
  const existingLower = new Set(sourceHeaders.map((h) => h.toLowerCase().trim()));

  // Prepend any essential columns that aren't already in the source
  const extraHeaders: string[] = [];
  for (const col of essentialColumns) {
    if (!existingLower.has(col.toLowerCase().trim())) {
      extraHeaders.push(col);
    }
  }

  const headers = [...extraHeaders, ...sourceHeaders];

  const rows = results.map((r) => {
    const originalRow = originalRows[r.sourceRow] || {};

    return headers.map((h) => {
      // Check if this column is translatable (case-insensitive match)
      const lower = h.toLowerCase().trim();
      const getter = translatableMap[lower];
      if (getter) return csvEscape(getter(r));

      // Pass through the original value unchanged
      // Use case-insensitive lookup to handle header casing differences
      const val = findValueCI(originalRow, h);
      return csvEscape(val || "");
    });
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Same-platform TSV export: preserves ALL original columns, replaces translatable fields.
 * Used for Amazon flat file format.
 */
function exportSamePlatformTSV(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[],
  headers: string[],
  translatableMap: Record<string, (r: LocalizationResultItem) => string>,
): string {
  const rows = results.map((r) => {
    const originalRow = originalRows[r.sourceRow] || {};
    return headers.map((h) => {
      const lower = h.toLowerCase().trim();
      const getter = translatableMap[lower];
      if (getter) return tsvEscape(getter(r));
      return tsvEscape(originalRow[h] || "");
    });
  });

  return [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
}

/**
 * Generate an XLSX workbook buffer from results.
 */
export async function exportXLSX(
  results: LocalizationResultItem[],
  targetLanguage: string,
  marketplace: MarketplaceProfile
): Promise<Uint8Array> {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  const mainData = results.map((r) => ({
    Row: r.sourceRow,
    "Original Title": r.original.title,
    [`${targetLanguage} Title`]: r.localized.title,
    "Original Description": r.original.description,
    [`${targetLanguage} Description`]: r.localized.description,
    ...(marketplace.bulletPointCount > 0
      ? Object.fromEntries(
          Array.from({ length: marketplace.bulletPointCount }, (_, i) => [
            [`Original Bullet ${i + 1}`, r.original.bulletPoints?.[i] || ""],
            [`${targetLanguage} Bullet ${i + 1}`, r.localized.bullet_points?.[i] || ""],
          ]).flat()
        )
      : {}),
    "Original Keywords": r.original.keywords || "",
    [`${targetLanguage} Keywords`]: r.localized.keywords || "",
  }));

  const ws = XLSX.utils.json_to_sheet(mainData);
  XLSX.utils.book_append_sheet(wb, ws, "Localized Listings");

  const qualityData = results
    .filter((r) => r.qualityFlags.length > 0)
    .flatMap((r) =>
      r.qualityFlags.map((f) => ({
        Row: r.sourceRow,
        Title: r.original.title,
        Field: f.field,
        Issue: f.issue,
        Detail: f.detail,
      }))
    );

  if (qualityData.length > 0) {
    const qws = XLSX.utils.json_to_sheet(qualityData);
    XLSX.utils.book_append_sheet(wb, qws, "Quality Report");
  }

  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}
