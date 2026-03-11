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

/** Minimal Shopify columns for cross-platform export */
const SHOPIFY_CROSS_PLATFORM_COLUMNS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Variant SKU", "Variant Price", "Image Src", "Image Alt Text",
  "SEO Title", "SEO Description", "Status",
];

const PASSTHROUGH_TO_SHOPIFY: Record<string, [string, string][]> = {
  etsy: [["sku", "variant sku"], ["price", "variant price"], ["image url 1", "image src"]],
  amazon: [["sku", "variant sku"], ["standard_price", "variant price"], ["brand_name", "vendor"]],
  unknown: [],
};

// ---- Etsy column definitions ----

/** Etsy translatable columns */
const ETSY_TRANSLATABLE: Record<string, (r: LocalizationResultItem) => string> = {
  "title": (r) => r.localized.title,
  "description": (r) => r.localized.description,
  "tags": (r) => r.localized.keywords || "",
};

/** Minimal Etsy columns for cross-platform export */
const ETSY_CROSS_PLATFORM_COLUMNS = [
  "Title", "Description", "Tags", "Price", "Currency Code", "Quantity", "SKU",
];

const PASSTHROUGH_TO_ETSY: Record<string, [string, string][]> = {
  shopify: [["variant sku", "sku"], ["variant price", "price"]],
  amazon: [["sku", "sku"], ["standard_price", "price"]],
  unknown: [],
};

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
 * Handles both same-platform (all columns preserved) and cross-platform exports.
 */
export function exportShopifyCSV(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[]
): string {
  if (results.length === 0) return "";

  const sourceHeaders = originalRows.length > 0 ? Object.keys(originalRows[0]) : [];
  const sourcePlatform = detectSourcePlatform(sourceHeaders);

  if (sourcePlatform === "shopify" && sourceHeaders.length > 0) {
    // Same-platform: preserve ALL original columns, replace translatable ones
    return exportSamePlatformCSV(results, originalRows, sourceHeaders, SHOPIFY_TRANSLATABLE);
  }

  // Cross-platform: generate Shopify format columns
  const headers = SHOPIFY_CROSS_PLATFORM_COLUMNS;
  const passthroughPairs = PASSTHROUGH_TO_SHOPIFY[sourcePlatform] || [];

  const rows = results.map((r) => {
    const originalRow = originalRows[r.sourceRow] || {};

    const passthrough: Record<string, string> = {};
    for (const [sourceCol, shopifyCol] of passthroughPairs) {
      const val = findValueCI(originalRow, sourceCol);
      if (val !== undefined) passthrough[shopifyCol] = val;
    }

    return headers.map((h) => {
      const lower = h.toLowerCase();
      const getter = SHOPIFY_TRANSLATABLE[lower];
      if (getter) return csvEscape(getter(r));
      return csvEscape(passthrough[lower] || "");
    });
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generate an Etsy-compatible CSV export.
 * Handles both same-platform (all columns preserved) and cross-platform exports.
 */
export function exportEtsyCSV(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[]
): string {
  if (results.length === 0) return "";

  const sourceHeaders = originalRows.length > 0 ? Object.keys(originalRows[0]) : [];
  const sourcePlatform = detectSourcePlatform(sourceHeaders);

  if (sourcePlatform === "etsy" && sourceHeaders.length > 0) {
    // Same-platform: preserve ALL original columns, replace translatable ones
    return exportSamePlatformCSV(results, originalRows, sourceHeaders, ETSY_TRANSLATABLE);
  }

  // Cross-platform: generate Etsy format columns
  const headers = ETSY_CROSS_PLATFORM_COLUMNS;
  const passthroughPairs = PASSTHROUGH_TO_ETSY[sourcePlatform] || [];

  const rows = results.map((r) => {
    const originalRow = originalRows[r.sourceRow] || {};

    const passthrough: Record<string, string> = {};
    for (const [sourceCol, etsyCol] of passthroughPairs) {
      const val = findValueCI(originalRow, sourceCol);
      if (val !== undefined) passthrough[etsyCol] = val;
    }

    return headers.map((h) => {
      const lower = h.toLowerCase();
      const getter = ETSY_TRANSLATABLE[lower];
      if (getter) return csvEscape(getter(r));
      return csvEscape(passthrough[lower] || "");
    });
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ---- Shared same-platform helpers ----

/**
 * Same-platform CSV export: preserves ALL original columns, replaces translatable fields.
 */
function exportSamePlatformCSV(
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
      if (getter) return csvEscape(getter(r));
      return csvEscape(originalRow[h] || "");
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
