import type { LocalizationResultItem, ParsedListing, LocalizedListing } from "../shared/schema";
import type { MarketplaceProfile } from "./marketplace-profiles";

/**
 * Generate a generic side-by-side CSV with original + localized columns.
 */
export function exportGenericCSV(
  results: LocalizationResultItem[],
  targetLanguage: string
): string {
  // Determine max bullet points across all results
  const maxBullets = results.reduce((max, r) => {
    const origCount = r.original.bulletPoints?.length || 0;
    const locCount = r.localized.bullet_points?.length || 0;
    return Math.max(max, origCount, locCount);
  }, 0);

  const headers = [
    "Row",
    "Original Title",
    `${targetLanguage} Title`,
    "Original Description",
    `${targetLanguage} Description`,
    ...Array.from({ length: maxBullets }, (_, i) => [
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
    ...Array.from({ length: maxBullets }, (_, i) => [
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
 */
export function exportAmazonFlatFile(
  results: LocalizationResultItem[],
  originalRows: Record<string, string>[]
): string {
  if (originalRows.length === 0) return "";

  const headers = Object.keys(originalRows[0]);

  // Map of internal field → Amazon column names
  const fieldToAmazon: Record<string, string> = {
    title: "item_name",
    description: "product_description",
    "bullet_points.0": "bullet_point1",
    "bullet_points.1": "bullet_point2",
    "bullet_points.2": "bullet_point3",
    "bullet_points.3": "bullet_point4",
    "bullet_points.4": "bullet_point5",
    keywords: "generic_keyword",
  };

  const rows = results.map((r) => {
    const originalRow = originalRows[r.sourceRow] || {};
    const row = { ...originalRow };

    // Overwrite translatable fields with localized values
    for (const [field, amazonCol] of Object.entries(fieldToAmazon)) {
      if (!(amazonCol in row)) continue;

      if (field === "title") {
        row[amazonCol] = r.localized.title;
      } else if (field === "description") {
        row[amazonCol] = r.localized.description;
      } else if (field === "keywords") {
        row[amazonCol] = r.localized.keywords || "";
      } else if (field.startsWith("bullet_points.")) {
        const idx = parseInt(field.split(".")[1], 10);
        row[amazonCol] = r.localized.bullet_points?.[idx] || "";
      }
    }

    return headers.map((h) => row[h] || "");
  });

  // Tab-delimited
  return [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
}

/**
 * Generate a Shopify-compatible CSV export.
 */
export function exportShopifyCSV(
  results: LocalizationResultItem[]
): string {
  const headers = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Tags",
    "SEO Title",
    "SEO Description",
  ];

  const rows = results.map((r) => {
    const handle = slugify(r.localized.title || r.original.title);
    return [
      csvEscape(handle),
      csvEscape(r.localized.title),
      csvEscape(r.localized.description),
      csvEscape(r.localized.keywords || ""),
      csvEscape(r.localized.seo_meta_title || ""),
      csvEscape(r.localized.seo_meta_description || ""),
    ];
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generate an Etsy-compatible CSV export.
 */
export function exportEtsyCSV(
  results: LocalizationResultItem[]
): string {
  // Etsy tags are comma-separated, max 13 tags, each under 20 chars
  const headers = ["Title", "Description", "Tags"];

  const rows = results.map((r) => [
    csvEscape(r.localized.title),
    csvEscape(r.localized.description),
    csvEscape(r.localized.keywords || ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Generate an XLSX workbook buffer from results.
 * Returns a base64-encoded string of the workbook.
 * Uses dynamic import of xlsx so this can run in Node or browser.
 */
export async function exportXLSX(
  results: LocalizationResultItem[],
  targetLanguage: string,
  marketplace: MarketplaceProfile
): Promise<Uint8Array> {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  // Main results sheet
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

  // Quality report sheet
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

// ---- Helpers ----

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}
