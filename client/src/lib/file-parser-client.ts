import Papa from "papaparse";
import type { ColumnMapping, ParsedListing } from "@shared/schema";

/** Raw parsed result before column mapping is applied */
export interface ParsedFileResult {
  headers: string[];
  rows: Record<string, string>[];
  detectedFormat: "csv" | "tsv" | "xlsx";
  /** Auto-suggested column mappings based on header names */
  suggestedMappings: ColumnMapping[];
}

// ---- Platform-specific exact column name → target field maps ----
// These are checked first (highest priority). Each maps a source column name
// to exactly one target field. Once a target field is assigned, it is never
// assigned again (no duplicates).

/** Shopify CSV exact column name → target field */
const SHOPIFY_EXACT_MAP: Record<string, string> = {
  "Title": "title",
  "Body (HTML)": "description",
  "Tags": "keywords",
  "SEO Title": "seoMetaTitle",
  "SEO Description": "seoMetaDescription",
  "Image Alt Text": "imageAltText",
  "Variant Price": "price",
  // Ignore columns (pass through unchanged)
  "Handle": "ignore",
  "Variant Compare At Price": "ignore",
  "Option1 Name": "ignore",
  "Option1 Value": "ignore",
  "Option2 Name": "ignore",
  "Option2 Value": "ignore",
  "Option3 Name": "ignore",
  "Option3 Value": "ignore",
  "Variant SKU": "ignore",
  "Vendor": "ignore",
  "Product Category": "ignore",
  "Type": "ignore",
  "Published": "ignore",
  "Image Src": "ignore",
  "Image Position": "ignore",
  "Status": "ignore",
  "Variant Inventory Qty": "ignore",
  "Variant Grams": "ignore",
  "Variant Inventory Policy": "ignore",
  "Variant Fulfillment Service": "ignore",
  "Variant Requires Shipping": "ignore",
  "Variant Taxable": "ignore",
  "Variant Barcode": "ignore",
  "Gift Card": "ignore",
  "Variant Image": "ignore",
  "Variant Weight Unit": "ignore",
  "Variant Tax Code": "ignore",
  "Cost per item": "ignore",
};

/** Etsy CSV exact column name → target field */
const ETSY_EXACT_MAP: Record<string, string> = {
  "Title": "title",
  "Description": "description",
  "Tags": "keywords",
  "Price": "price",
  // Ignore columns
  "Listing ID": "ignore",
  "Currency Code": "ignore",
  "Quantity": "ignore",
  "Materials": "ignore",
  "Image URL 1": "ignore",
  "Image URL 2": "ignore",
  "Image URL 3": "ignore",
  "Image URL 4": "ignore",
  "Image URL 5": "ignore",
  "Section": "ignore",
  "Category": "ignore",
  "SKU": "ignore",
  "State": "ignore",
  "Shop Section": "ignore",
  "Renewal": "ignore",
  "Who Made": "ignore",
  "When Made": "ignore",
  "Recipient": "ignore",
  "Occasion": "ignore",
  "Style": "ignore",
  "Shipping Template": "ignore",
  "Processing Min": "ignore",
  "Processing Max": "ignore",
};

/** Amazon flat file exact column name → target field */
const AMAZON_EXACT_MAP: Record<string, string> = {
  "item_name": "title",
  "Product Title": "title",
  "product_description": "description",
  "bullet_point1": "bulletPoints.0",
  "bullet_point2": "bulletPoints.1",
  "bullet_point3": "bulletPoints.2",
  "bullet_point4": "bulletPoints.3",
  "bullet_point5": "bulletPoints.4",
  "generic_keyword": "keywords",
  "generic_keywords1": "keywords",
  "standard_price": "price",
  // Ignore columns
  "sku": "ignore",
  "asin": "ignore",
  "brand": "ignore",
  "brand_name": "ignore",
  "manufacturer": "ignore",
  "upc": "ignore",
  "ean": "ignore",
  "parent_sku": "ignore",
  "parent_child": "ignore",
  "variation_theme": "ignore",
  "item_type": "ignore",
  "recommended_browse_nodes": "ignore",
};

// ---- Fallback fuzzy patterns (only used when no exact match is found) ----

const FUZZY_RULES: { patterns: string[]; target: string }[] = [
  { patterns: ["title", "product_title", "product_name", "item_name", "listing_title"], target: "title" },
  { patterns: ["description", "product_description", "body_html", "body", "listing_description"], target: "description" },
  { patterns: ["bullet_point", "bulletpoint", "feature_bullet", "product_bullet", "key_product_feature"], target: "bulletPoints" },
  { patterns: ["search_terms", "keywords", "tags", "generic_keyword", "generic_keywords", "search_keywords"], target: "keywords" },
  { patterns: ["seo_title", "meta_title"], target: "seoMetaTitle" },
  { patterns: ["seo_description", "meta_description"], target: "seoMetaDescription" },
  { patterns: ["image_alt_text", "image_alt", "alt_text"], target: "imageAltText" },
  { patterns: ["standard_price", "variant_price", "list_price", "sale_price"], target: "price" },
  { patterns: ["product_type", "item_type", "recommended_browse_nodes"], target: "category" },
];

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s\-()]+/g, "_").trim();
}

/**
 * Detect which platform the CSV likely came from based on header names.
 */
function detectPlatform(headers: string[]): "shopify" | "etsy" | "amazon" | "unknown" {
  const headerSet = new Set(headers);
  if (headerSet.has("Body (HTML)") || headerSet.has("Variant SKU") || headerSet.has("Handle")) {
    return "shopify";
  }
  if (headerSet.has("Listing ID") || headerSet.has("Currency Code") || headerSet.has("Who Made")) {
    return "etsy";
  }
  if (headerSet.has("item_name") || headerSet.has("bullet_point1") || headerSet.has("generic_keyword") || headerSet.has("asin")) {
    return "amazon";
  }
  return "unknown";
}

/**
 * Auto-detect column mappings from header names.
 * Uses exact-match priority to avoid duplicate mappings.
 *
 * Strategy:
 * 1. Detect platform (Shopify, Etsy, Amazon) from header fingerprints
 * 2. First pass: exact column name matches from platform-specific map
 * 3. Second pass: fuzzy/substring matching for remaining unmapped columns
 * 4. Never map two source columns to the same target field (except "ignore" and "doNotTranslate")
 */
export function autoDetectColumns(headers: string[]): ColumnMapping[] {
  const platform = detectPlatform(headers);

  // Pick the right exact-match map for the detected platform
  const exactMap: Record<string, string> =
    platform === "shopify" ? SHOPIFY_EXACT_MAP :
    platform === "etsy" ? ETSY_EXACT_MAP :
    platform === "amazon" ? AMAZON_EXACT_MAP :
    {};

  // Track which target fields have already been assigned (to prevent duplicates).
  // "ignore" and "doNotTranslate" can be reused, so they're never added here.
  const usedTargets = new Set<string>();
  const mappings: ColumnMapping[] = new Array(headers.length);
  const unmappedIndices: number[] = [];

  let bulletIndex = 0;

  // Pass 1: exact matches from platform-specific map
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const target = exactMap[header];

    if (target !== undefined) {
      if (target === "ignore" || target === "doNotTranslate") {
        mappings[i] = { sourceColumn: header, targetField: target };
      } else if (!usedTargets.has(target)) {
        mappings[i] = { sourceColumn: header, targetField: target };
        usedTargets.add(target);
        if (target.startsWith("bulletPoints.")) bulletIndex++;
      } else {
        // Target already taken — leave for pass 2 or default to ignore
        unmappedIndices.push(i);
      }
    } else {
      unmappedIndices.push(i);
    }
  }

  // Pass 2: fuzzy matching for remaining unmapped columns
  for (const i of unmappedIndices) {
    const header = headers[i];
    const norm = normalizeHeader(header);
    let matched = false;

    for (const rule of FUZZY_RULES) {
      // Only match if normalized header exactly equals a pattern
      // or starts/ends with the pattern (to catch numbered variants like bullet_point3)
      const isMatch = rule.patterns.some(
        (p) =>
          norm === p ||
          norm === p + "s" ||
          (!/\d/.test(p) && new RegExp(`^${p}_?\\d+$`).test(norm))
      );

      if (!isMatch) continue;

      if (rule.target === "bulletPoints") {
        const idx = Math.min(bulletIndex, 4);
        const bulletTarget = `bulletPoints.${idx}`;
        if (!usedTargets.has(bulletTarget)) {
          mappings[i] = { sourceColumn: header, targetField: bulletTarget };
          usedTargets.add(bulletTarget);
          bulletIndex++;
          matched = true;
        }
      } else if (!usedTargets.has(rule.target)) {
        mappings[i] = { sourceColumn: header, targetField: rule.target };
        usedTargets.add(rule.target);
        matched = true;
      }
      break; // First matching rule wins
    }

    if (!matched) {
      mappings[i] = { sourceColumn: header, targetField: "ignore" };
    }
  }

  return mappings;
}

/**
 * Parse a CSV or TSV string into headers + rows.
 */
function parseDelimited(text: string): { headers: string[]; rows: Record<string, string>[]; isTab: boolean } {
  // Detect tab-delimited (Amazon flat file)
  const firstLine = text.split("\n")[0] || "";
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const isTab = tabCount > commaCount;

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    delimiter: isTab ? "\t" : ",",
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  return {
    headers: result.meta.fields || [],
    rows: result.data,
    isTab,
  };
}

/**
 * Parse an uploaded file (CSV, TSV, or XLSX) into a structured result.
 * Runs entirely client-side — no API call needed.
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "xlsx" || extension === "xls") {
    return parseExcelFile(file);
  }

  // CSV or TSV
  const text = await file.text();
  const { headers, rows, isTab } = parseDelimited(text);
  const suggestedMappings = autoDetectColumns(headers);

  return {
    headers,
    rows,
    detectedFormat: isTab ? "tsv" : "csv",
    suggestedMappings,
  };
}

/**
 * Parse an Excel file (.xlsx / .xls) into a structured result.
 */
async function parseExcelFile(file: File): Promise<ParsedFileResult> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  const headers =
    jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  const suggestedMappings = autoDetectColumns(headers);

  return {
    headers,
    rows: jsonData,
    detectedFormat: "xlsx",
    suggestedMappings,
  };
}

/**
 * Apply column mappings to raw rows → produce ParsedListing[].
 * This converts the flat row data into our internal structured format.
 */
export function applyColumnMappings(
  rows: Record<string, string>[],
  mappings: ColumnMapping[]
): ParsedListing[] {
  return rows.map((row, rowIndex) => {
    const listing: ParsedListing = {
      title: "",
      description: "",
      sourceRow: rowIndex,
      extraFields: {},
    };

    const bulletPoints: (string | undefined)[] = [];

    for (const mapping of mappings) {
      const value = row[mapping.sourceColumn] || "";
      const target = mapping.targetField;

      if (target === "ignore" || target === "doNotTranslate") {
        // Preserve in extraFields for re-export
        if (value) {
          listing.extraFields![mapping.sourceColumn] = value;
        }
        continue;
      }

      if (target === "title") {
        listing.title = value;
      } else if (target === "description") {
        listing.description = value;
      } else if (target === "seoMetaTitle") {
        listing.seoMetaTitle = value;
      } else if (target === "seoMetaDescription") {
        listing.seoMetaDescription = value;
      } else if (target === "imageAltText") {
        listing.imageAltText = value;
      } else if (target === "keywords") {
        listing.keywords = value;
      } else if (target === "price") {
        listing.price = value;
      } else if (target === "category") {
        listing.category = value;
      } else if (target.startsWith("bulletPoints.")) {
        const idx = parseInt(target.split(".")[1], 10);
        bulletPoints[idx] = value;
      }
    }

    // Preserve bullet points with their positions (empty strings for missing ones)
    if (bulletPoints.length > 0) {
      listing.bulletPoints = Array.from(
        { length: Math.min(bulletPoints.length, 5) },
        (_, i) => bulletPoints[i] || ""
      );
    }

    return listing;
  });
}

/** Supported file extensions for the upload component */
export const SUPPORTED_EXTENSIONS = [".csv", ".tsv", ".xlsx", ".xls"];
export const SUPPORTED_MIME_TYPES = [
  "text/csv",
  "text/tab-separated-values",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
