import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ColumnMapping, ParsedListing } from "@shared/schema";

/** Raw parsed result before column mapping is applied */
export interface ParsedFileResult {
  headers: string[];
  rows: Record<string, string>[];
  detectedFormat: "csv" | "tsv" | "xlsx";
  /** Auto-suggested column mappings based on header names */
  suggestedMappings: ColumnMapping[];
}

// ---- Smart defaults for auto-detecting columns ----

const TITLE_PATTERNS = [
  "title", "product_title", "name", "product_name", "item_name", "listing_title",
];
const DESCRIPTION_PATTERNS = [
  "description", "product_description", "body_html", "body", "listing_description",
  "product_description_html",
];
const BULLET_PATTERNS = [
  "bullet_point", "bullet_point1", "bullet_point2", "bullet_point3",
  "bullet_point4", "bullet_point5",
  "bulletpoint", "bulletpoint1", "bulletpoint2", "bulletpoint3",
  "bulletpoint4", "bulletpoint5",
  "bullet", "bullet1", "bullet2", "bullet3", "bullet4", "bullet5",
  "key_product_features", "key_product_feature",
  "feature_bullet", "product_bullet",
];
const KEYWORD_PATTERNS = [
  "search_terms", "keywords", "tags", "generic_keyword", "generic_keywords",
  "search_keywords",
];
const PRICE_PATTERNS = ["price", "standard_price", "list_price", "sale_price"];
const CATEGORY_PATTERNS = [
  "category", "product_type", "item_type", "recommended_browse_nodes",
];

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s\-]+/g, "_").trim();
}

function matchesPatterns(normalized: string, patterns: string[]): boolean {
  return patterns.some(
    (p) =>
      normalized === p ||
      normalized.startsWith(p + "_") ||
      normalized.endsWith("_" + p) ||
      // Match "bullet_1" against "bullet" pattern (base + _N suffix)
      (!/\d/.test(p) && new RegExp(`^${p}_?\\d+$`).test(normalized))
  );
}

/**
 * Auto-detect column mappings from header names.
 * Returns suggested mappings with smart defaults.
 */
export function autoDetectColumns(headers: string[]): ColumnMapping[] {
  let bulletIndex = 0;

  return headers.map((header) => {
    const norm = normalizeHeader(header);

    if (matchesPatterns(norm, TITLE_PATTERNS)) {
      return { sourceColumn: header, targetField: "title" };
    }
    if (matchesPatterns(norm, DESCRIPTION_PATTERNS)) {
      return { sourceColumn: header, targetField: "description" };
    }
    if (matchesPatterns(norm, BULLET_PATTERNS)) {
      const idx = Math.min(bulletIndex, 4);
      bulletIndex++;
      return { sourceColumn: header, targetField: `bulletPoints.${idx}` };
    }
    if (matchesPatterns(norm, KEYWORD_PATTERNS)) {
      return { sourceColumn: header, targetField: "keywords" };
    }
    if (matchesPatterns(norm, PRICE_PATTERNS)) {
      return { sourceColumn: header, targetField: "price" };
    }
    if (matchesPatterns(norm, CATEGORY_PATTERNS)) {
      return { sourceColumn: header, targetField: "category" };
    }

    // Default: ignore unmapped columns (user can remap in UI)
    return { sourceColumn: header, targetField: "ignore" };
  });
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
