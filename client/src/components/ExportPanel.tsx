import { useState } from "react";
import { Download, FileSpreadsheet, AlertTriangle, Check, ChevronDown } from "lucide-react";
import type { LocalizationResultItem, QualityFlag } from "@shared/schema";
import { MARKETPLACE_PROFILES } from "../../../lib/marketplace-profiles";
import {
  exportGenericCSV,
  exportAmazonFlatFile,
  exportShopifyCSV,
  exportEtsyCSV,
  exportXLSX,
} from "../../../lib/export-formatter";

interface ExportPanelProps {
  results: LocalizationResultItem[];
  marketplace: string;
  targetLanguage: string;
  /** Original raw rows from the uploaded file — needed for Amazon flat file re-export */
  originalRows?: Record<string, string>[];
}

type ExportFormat = "generic_csv" | "amazon_flat" | "shopify_csv" | "etsy_csv" | "xlsx";

const FORMAT_OPTIONS: { id: ExportFormat; label: string; description: string; marketplaces: string[] }[] = [
  {
    id: "generic_csv",
    label: "Generic CSV",
    description: "Side-by-side original + translated columns",
    marketplaces: [],
  },
  {
    id: "xlsx",
    label: "Excel (.xlsx)",
    description: "Full workbook with quality report sheet",
    marketplaces: [],
  },
  {
    id: "amazon_flat",
    label: "Amazon Flat File",
    description: "Tab-delimited file for Seller Central import",
    marketplaces: ["amazon_de", "amazon_fr", "amazon_es", "amazon_it", "amazon_jp"],
  },
  {
    id: "shopify_csv",
    label: "Shopify CSV",
    description: "CSV matching Shopify product import schema",
    marketplaces: ["shopify_international"],
  },
  {
    id: "etsy_csv",
    label: "Etsy CSV",
    description: "CSV matching Etsy bulk edit format",
    marketplaces: ["etsy_international"],
  },
];

export default function ExportPanel({
  results,
  marketplace,
  targetLanguage,
  originalRows,
}: ExportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("generic_csv");
  const [exporting, setExporting] = useState(false);

  const profile = MARKETPLACE_PROFILES[marketplace];

  // Filter format options to show relevant ones first
  const relevantFormats = FORMAT_OPTIONS.filter(
    (f) => f.marketplaces.length === 0 || f.marketplaces.includes(marketplace)
  );

  // Aggregate quality stats
  const totalFlags = results.reduce((sum, r) => sum + r.qualityFlags.length, 0);
  const listingsWithFlags = results.filter((r) => r.qualityFlags.length > 0).length;
  const exceededLimits = results
    .flatMap((r) => r.qualityFlags)
    .filter((f) => f.issue === "exceeded_limit").length;

  const handleExport = async () => {
    setExporting(true);
    try {
      let content: string | Uint8Array;
      let filename: string;
      let mimeType: string;

      switch (selectedFormat) {
        case "amazon_flat":
          content = exportAmazonFlatFile(results, originalRows || []);
          filename = `buzztate_amazon_${targetLanguage.toLowerCase()}.tsv`;
          mimeType = "text/tab-separated-values";
          break;
        case "shopify_csv":
          content = exportShopifyCSV(results);
          filename = `buzztate_shopify_${targetLanguage.toLowerCase()}.csv`;
          mimeType = "text/csv;charset=utf-8;";
          break;
        case "etsy_csv":
          content = exportEtsyCSV(results);
          filename = `buzztate_etsy_${targetLanguage.toLowerCase()}.csv`;
          mimeType = "text/csv;charset=utf-8;";
          break;
        case "xlsx":
          content = await exportXLSX(results, targetLanguage, profile);
          filename = `buzztate_${marketplace}_${targetLanguage.toLowerCase()}.xlsx`;
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
        default:
          content = exportGenericCSV(results, targetLanguage);
          filename = `buzztate_localized_${targetLanguage.toLowerCase()}.csv`;
          mimeType = "text/csv;charset=utf-8;";
      }

      const blob =
        content instanceof Uint8Array
          ? new Blob([content], { type: mimeType })
          : new Blob([content], { type: mimeType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setExporting(false);
  };

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
              {results.length} listing{results.length !== 1 ? "s" : ""} localized for{" "}
              {profile?.name || marketplace} in {targetLanguage}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || results.length === 0}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Download"}
          </button>
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

      {/* Format selector */}
      <div className="p-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
          Export Format
        </label>
        <div className="space-y-2">
          {relevantFormats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                selectedFormat === fmt.id
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-gray-800 hover:border-gray-700 bg-black/20"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedFormat === fmt.id ? "border-green-400" : "border-gray-600"
                }`}
              >
                {selectedFormat === fmt.id && (
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${selectedFormat === fmt.id ? "text-white" : "text-gray-400"}`}>
                  {fmt.label}
                </p>
                <p className="text-xs text-gray-600">{fmt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

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
                  <th className="text-left p-1">Field</th>
                  <th className="text-left p-1">Issue</th>
                  <th className="text-left p-1">Detail</th>
                </tr>
              </thead>
              <tbody>
                {results
                  .filter((r) => r.qualityFlags.length > 0)
                  .flatMap((r) =>
                    r.qualityFlags.map((f, i) => (
                      <tr key={`${r.sourceRow}-${i}`} className="border-t border-gray-800/50">
                        <td className="p-1 text-gray-400">{r.sourceRow}</td>
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
                  )}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
