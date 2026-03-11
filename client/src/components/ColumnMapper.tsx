import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Check, AlertTriangle, Save, Sparkles } from "lucide-react";
import { MAPPING_TARGETS, type ColumnMapping, type MappingTarget } from "@shared/schema";

interface ColumnMapperProps {
  headers: string[];
  suggestedMappings: ColumnMapping[];
  rows: Record<string, string>[];
  onMappingsConfirmed: (mappings: ColumnMapping[]) => void;
}

const STORAGE_KEY = "buzztate_column_mappings";

const TARGET_LABELS: Record<string, string> = {
  title: "Product Title",
  description: "Description",
  "bulletPoints.0": "Bullet Point 1",
  "bulletPoints.1": "Bullet Point 2",
  "bulletPoints.2": "Bullet Point 3",
  "bulletPoints.3": "Bullet Point 4",
  "bulletPoints.4": "Bullet Point 5",
  keywords: "Keywords / Tags",
  price: "Price (do not translate)",
  category: "Category (do not translate)",
  doNotTranslate: "Do Not Translate",
  ignore: "Ignore Column",
};

function saveMappingsToStorage(headers: string[], mappings: ColumnMapping[]) {
  try {
    const key = headers.sort().join("|");
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    stored[key] = mappings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // localStorage may be unavailable
  }
}

function loadMappingsFromStorage(headers: string[]): ColumnMapping[] | null {
  try {
    const key = headers.sort().join("|");
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored[key] || null;
  } catch {
    return null;
  }
}

export default function ColumnMapper({
  headers,
  suggestedMappings,
  rows,
  onMappingsConfirmed,
}: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [usedSaved, setUsedSaved] = useState(false);

  // Track which fields were auto-detected (from suggestedMappings)
  const autoDetectedFields = useMemo(() => {
    const set = new Set<string>();
    for (const m of suggestedMappings) {
      if (m.targetField !== "ignore") {
        set.add(m.sourceColumn);
      }
    }
    return set;
  }, [suggestedMappings]);

  useEffect(() => {
    const saved = loadMappingsFromStorage(headers);
    if (saved && saved.length === headers.length) {
      setMappings(saved);
      setUsedSaved(true);
    } else {
      setMappings(suggestedMappings);
    }
  }, [headers, suggestedMappings]);

  const updateMapping = (index: number, targetField: string) => {
    setMappings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], targetField };
      return next;
    });
  };

  // Validation
  const hasTitleMapping = mappings.some((m) => m.targetField === "title");
  const hasDescriptionMapping = mappings.some((m) => m.targetField === "description");
  const duplicates = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of mappings) {
      if (m.targetField !== "ignore" && m.targetField !== "doNotTranslate") {
        counts[m.targetField] = (counts[m.targetField] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .filter(([, count]) => count > 1)
      .map(([field]) => field);
  }, [mappings]);

  const isValid = hasTitleMapping && duplicates.length === 0;

  const autoDetectedCount = useMemo(
    () => mappings.filter((m) => m.targetField !== "ignore" && !usedSaved && autoDetectedFields.has(m.sourceColumn)).length,
    [mappings, usedSaved, autoDetectedFields]
  );

  const noAutoDetected = !usedSaved && autoDetectedCount === 0;

  const previewRow = rows[0] || {};

  const handleConfirm = () => {
    saveMappingsToStorage(headers, mappings);
    onMappingsConfirmed(mappings);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/60">
        <div>
          <h3 className="text-sm font-bold text-white">Map Your Columns</h3>
          <p className="text-xs text-gray-500 mt-1">
            {rows.length} row{rows.length !== 1 ? "s" : ""} detected
            {usedSaved && (
              <span className="ml-2 text-green-400">
                <Save size={10} className="inline mr-1" />
                Restored saved mapping
              </span>
            )}
            {!usedSaved && autoDetectedCount > 0 && (
              <span className="ml-2 text-blue-400">
                <Sparkles size={10} className="inline mr-1" />
                {autoDetectedCount} column{autoDetectedCount !== 1 ? "s" : ""} auto-detected
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleConfirm}
          disabled={!isValid}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            isValid
              ? "bg-yellow-400 text-black hover:bg-yellow-300"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Check size={14} />
          Confirm Mapping
        </button>
      </div>

      {/* Validation warnings */}
      {noAutoDetected && (
        <div className="mx-4 mt-3 flex items-center gap-2 text-blue-400 text-xs bg-blue-400/5 border border-blue-400/20 rounded-lg p-2">
          <Sparkles size={14} />
          <span>We couldn't auto-detect your columns. Please manually map your product title and description fields below.</span>
        </div>
      )}
      {!hasTitleMapping && (
        <div className="mx-4 mt-3 flex items-center gap-2 text-amber-400 text-xs bg-amber-400/5 border border-amber-400/20 rounded-lg p-2">
          <AlertTriangle size={14} />
          <span>You must map at least one column to "Product Title"</span>
        </div>
      )}
      {hasTitleMapping && !hasDescriptionMapping && (
        <div className="mx-4 mt-3 flex items-center gap-2 text-amber-400 text-xs bg-amber-400/5 border border-amber-400/20 rounded-lg p-2">
          <AlertTriangle size={14} />
          <span>Consider mapping a column to "Description" for better results</span>
        </div>
      )}
      {duplicates.length > 0 && (
        <div className="mx-4 mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-400/5 border border-red-400/20 rounded-lg p-2">
          <AlertTriangle size={14} />
          <span>
            Duplicate mapping: {duplicates.map((d) => TARGET_LABELS[d] || d).join(", ")}. Each column can only map to one field.
          </span>
        </div>
      )}

      {/* Mapping table */}
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="text-gray-500 text-xs uppercase tracking-wider">
              <th className="text-left p-3 pl-4 font-bold">Source Column</th>
              <th className="text-left p-3 font-bold">Preview</th>
              <th className="text-left p-3 pr-4 font-bold">Maps To</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping, index) => {
              const isAutoDetected = !usedSaved && autoDetectedFields.has(mapping.sourceColumn) && mapping.targetField !== "ignore";
              const isRequired = mapping.targetField === "title" || mapping.targetField === "description";

              return (
                <tr
                  key={mapping.sourceColumn}
                  className="border-t border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                >
                  <td className="p-3 pl-4">
                    <span className="font-mono text-gray-300 text-xs">{mapping.sourceColumn}</span>
                    {isAutoDetected && (
                      <span className="ml-2 text-[10px] bg-blue-400/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">
                        Auto-detected
                      </span>
                    )}
                  </td>

                  <td className="p-3 max-w-[200px]">
                    <span className="text-xs text-gray-500 truncate block">
                      {previewRow[mapping.sourceColumn]
                        ? previewRow[mapping.sourceColumn].substring(0, 60) +
                          (previewRow[mapping.sourceColumn].length > 60 ? "..." : "")
                        : "\u2014"}
                    </span>
                  </td>

                  <td className="p-3 pr-4">
                    <div className="relative">
                      <select
                        value={mapping.targetField}
                        onChange={(e) => updateMapping(index, e.target.value)}
                        className={`w-full bg-black border rounded-lg py-2 px-3 pr-8 text-xs appearance-none cursor-pointer transition-colors outline-none ${
                          mapping.targetField === "ignore"
                            ? "border-gray-800 text-gray-500"
                            : mapping.targetField === "doNotTranslate"
                            ? "border-blue-500/30 text-blue-400"
                            : isRequired
                            ? "border-yellow-400/40 text-white"
                            : "border-gray-700 text-white"
                        }`}
                      >
                        {MAPPING_TARGETS.map((target) => (
                          <option key={target} value={target}>
                            {TARGET_LABELS[target] || target}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
