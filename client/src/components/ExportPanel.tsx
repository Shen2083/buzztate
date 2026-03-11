import { useState } from "react";
import { Download, FileSpreadsheet, AlertTriangle, Check, ChevronDown, Loader2, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { trackFileDownload } from "@/lib/gtag";
import type { LocalizationResultItem, QualityFlag } from "@shared/schema";
import { MARKETPLACE_PROFILES } from "../../../lib/marketplace-profiles";
import type { MarketplaceId } from "../../../lib/marketplace-profiles";
import {
  exportGenericCSV,
  exportAmazonFlatFile,
  exportShopifyCSV,
  exportEtsyCSV,
  exportXLSX,
} from "../../../lib/export-formatter";
import JSZip from "jszip";

/** Results grouped by marketplace */
export interface MultiMarketplaceResults {
  [marketplaceId: string]: {
    results: LocalizationResultItem[];
    targetLanguage: string;
  };
}

interface ExportPanelProps {
  /** Results per marketplace */
  multiResults: MultiMarketplaceResults;
  /** Original raw rows from the uploaded file */
  originalRows?: Record<string, string>[];
  /** Is this a single-marketplace export? (skip ZIP) */
  isSingleMarketplace?: boolean;
}

function getMarketplaceExportContent(
  marketplaceId: string,
  results: LocalizationResultItem[],
  targetLanguage: string,
  originalRows: Record<string, string>[]
): { content: string; filename: string; mimeType: string } {
  if (marketplaceId.startsWith("amazon_")) {
    return {
      content: exportAmazonFlatFile(results, originalRows),
      filename: `${marketplaceId}.tsv`,
      mimeType: "text/tab-separated-values",
    };
  } else if (marketplaceId === "shopify_international") {
    return {
      content: exportShopifyCSV(results, originalRows),
      filename: `shopify_${targetLanguage.toLowerCase()}.csv`,
      mimeType: "text/csv;charset=utf-8;",
    };
  } else if (marketplaceId === "etsy_international") {
    return {
      content: exportEtsyCSV(results, originalRows),
      filename: `etsy_${targetLanguage.toLowerCase()}.csv`,
      mimeType: "text/csv;charset=utf-8;",
    };
  }
  return {
    content: exportGenericCSV(results, targetLanguage),
    filename: `${marketplaceId}_${targetLanguage.toLowerCase()}.csv`,
    mimeType: "text/csv;charset=utf-8;",
  };
}

function buildSummaryCSV(multiResults: MultiMarketplaceResults): string {
  const headers = ["listing_title", "marketplace", "status", "warnings", "char_counts"];
  const rows: string[][] = [];

  for (const [marketplaceId, { results, targetLanguage }] of Object.entries(multiResults)) {
    const profile = MARKETPLACE_PROFILES[marketplaceId];
    const marketplaceName = profile?.name || marketplaceId;

    for (const r of results) {
      const hasErrors = r.qualityFlags.some((f) => f.issue === "api_error" || f.issue === "content_filter");
      const hasWarnings = r.qualityFlags.length > 0 && !hasErrors;
      const status = hasErrors ? "failed" : hasWarnings ? "warning" : "success";
      const warnings = r.qualityFlags.map((f) => `${f.field}: ${f.detail}`).join("; ") || "";
      const titleLen = r.localized.title?.length || 0;
      const descLen = r.localized.description?.length || 0;
      const charCounts = `title:${titleLen}, desc:${descLen}`;

      rows.push([
        csvEscape(r.original.title),
        csvEscape(marketplaceName),
        status,
        csvEscape(warnings),
        csvEscape(charCounts),
      ]);
    }
  }

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExportPanel({
  multiResults,
  originalRows,
  isSingleMarketplace = false,
}: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [exportingIndividual, setExportingIndividual] = useState<string | null>(null);

  const marketplaceIds = Object.keys(multiResults);
  const totalResults = Object.values(multiResults).reduce((s, m) => s + m.results.length, 0);

  // Aggregate quality stats
  const allResults = Object.values(multiResults).flatMap((m) => m.results);
  const totalFlags = allResults.reduce((sum, r) => sum + r.qualityFlags.length, 0);
  const listingsWithFlags = allResults.filter((r) => r.qualityFlags.length > 0).length;
  const exceededLimits = allResults
    .flatMap((r) => r.qualityFlags)
    .filter((f) => f.issue === "exceeded_limit").length;

  // Single marketplace: simple single-file download (legacy behavior)
  const handleSingleDownload = async (marketplaceId: string) => {
    setExportingIndividual(marketplaceId);
    try {
      const { results, targetLanguage } = multiResults[marketplaceId];
      const { content, filename, mimeType } = getMarketplaceExportContent(
        marketplaceId,
        results,
        targetLanguage,
        originalRows || []
      );
      const blob = new Blob([content], { type: mimeType });
      downloadBlob(blob, `buzztate_${filename}`);
      trackFileDownload("individual", marketplaceId);
      toast({ title: "Download started", description: `buzztate_${filename} is downloading.` });
    } catch (err) {
      console.error("Export failed:", err);
      toast({ title: "Export failed", description: "Please try again.", variant: "destructive" });
    }
    setExportingIndividual(null);
  };

  // Multi marketplace: ZIP download
  const handleZipDownload = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("buzztate_localized")!;

      for (const [marketplaceId, { results, targetLanguage }] of Object.entries(multiResults)) {
        const { content, filename } = getMarketplaceExportContent(
          marketplaceId,
          results,
          targetLanguage,
          originalRows || []
        );
        folder.file(filename, content);
      }

      // Add summary CSV
      const summary = buildSummaryCSV(multiResults);
      folder.file("_summary.csv", summary);

      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "buzztate_localized.zip");
      trackFileDownload("zip", "all");
      toast({ title: "Download started", description: "buzztate_localized.zip is downloading." });
    } catch (err) {
      console.error("ZIP export failed:", err);
      toast({ title: "Export failed", description: "Please try again.", variant: "destructive" });
    }
    setExporting(false);
  };

  // For single marketplace, use the first one for profile display
  const singleMarketplaceId = isSingleMarketplace ? marketplaceIds[0] : null;
  const singleProfile = singleMarketplaceId ? MARKETPLACE_PROFILES[singleMarketplaceId] : null;
  const singleLang = singleMarketplaceId ? multiResults[singleMarketplaceId]?.targetLanguage : null;

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/60">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-green-400" />
              Export Results
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isSingleMarketplace && singleProfile
                ? `${totalResults} listing${totalResults !== 1 ? "s" : ""} localized for ${singleProfile.name} in ${singleLang}`
                : `${totalResults} localizations across ${marketplaceIds.length} marketplace${marketplaceIds.length !== 1 ? "s" : ""}`
              }
            </p>
          </div>
          {isSingleMarketplace && singleMarketplaceId ? (
            <button
              onClick={() => handleSingleDownload(singleMarketplaceId)}
              disabled={exporting || totalResults === 0}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
            >
              {exportingIndividual ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exportingIndividual ? "Preparing..." : "Download"}
            </button>
          ) : (
            <button
              onClick={handleZipDownload}
              disabled={exporting || totalResults === 0}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
              {exporting ? "Preparing ZIP..." : "Download All (ZIP)"}
            </button>
          )}
        </div>
      </div>

      {/* Quality summary */}
      {totalFlags > 0 ? (
        <div className="mx-4 mt-3 flex items-start gap-2 text-amber-400 text-xs bg-amber-400/5 border border-amber-400/20 rounded-lg p-3">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              {listingsWithFlags} listing{listingsWithFlags !== 1 ? "s" : ""} with quality flags
            </p>
            {exceededLimits > 0 && (
              <p className="mt-1 text-amber-300">
                {exceededLimits} field{exceededLimits !== 1 ? "s" : ""} exceeded character limits
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-3 flex items-center gap-2 text-green-400 text-xs bg-green-400/5 border border-green-400/20 rounded-lg p-3">
          <Check size={14} />
          <span className="font-bold">All listings passed quality checks</span>
        </div>
      )}

      {/* Per-marketplace file downloads (multi-marketplace only) */}
      {!isSingleMarketplace && marketplaceIds.length > 1 && (
        <div className="p-4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            Individual Files
          </label>
          <div className="space-y-2">
            {marketplaceIds.map((mpId) => {
              const { results, targetLanguage } = multiResults[mpId];
              const profile = MARKETPLACE_PROFILES[mpId];
              const { filename } = getMarketplaceExportContent(mpId, results, targetLanguage, []);
              const isExporting = exportingIndividual === mpId;

              return (
                <div
                  key={mpId}
                  className="flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm text-gray-300 font-medium">
                      {profile?.name || mpId}
                    </p>
                    <p className="text-xs text-gray-600">
                      {results.length} listing{results.length !== 1 ? "s" : ""} — {filename}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSingleDownload(mpId)}
                    disabled={isExporting}
                    className="text-xs text-green-400 hover:text-green-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quality detail (collapsed) */}
      {totalFlags > 0 && (
        <details className="border-t border-gray-800">
          <summary className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-400 flex items-center gap-1">
            <ChevronDown size={12} />
            Quality Report Details
          </summary>
          <div className="px-4 pb-4 max-h-[200px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-600">
                  <th className="text-left p-1">Row</th>
                  {!isSingleMarketplace && <th className="text-left p-1">Marketplace</th>}
                  <th className="text-left p-1">Field</th>
                  <th className="text-left p-1">Issue</th>
                  <th className="text-left p-1">Detail</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(multiResults)
                  .flatMap(([mpId, { results }]) =>
                    results
                      .filter((r) => r.qualityFlags.length > 0)
                      .flatMap((r) =>
                        r.qualityFlags.map((f, i) => (
                          <tr key={`${mpId}-${r.sourceRow}-${i}`} className="border-t border-gray-800/50">
                            <td className="p-1 text-gray-400">{r.sourceRow}</td>
                            {!isSingleMarketplace && (
                              <td className="p-1 text-gray-400">{MARKETPLACE_PROFILES[mpId]?.name || mpId}</td>
                            )}
                            <td className="p-1 text-gray-400 font-mono">{f.field}</td>
                            <td className="p-1">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  f.issue === "exceeded_limit"
                                    ? "bg-red-400/10 text-red-400"
                                    : f.issue === "empty"
                                    ? "bg-red-400/10 text-red-400"
                                    : "bg-amber-400/10 text-amber-400"
                                }`}
                              >
                                {f.issue}
                              </span>
                            </td>
                            <td className="p-1 text-gray-500">{f.detail}</td>
                          </tr>
                        ))
                      )
                  )}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
