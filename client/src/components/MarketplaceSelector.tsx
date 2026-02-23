import { useState } from "react";
import { Check, Globe, ShoppingBag, Store } from "lucide-react";
import { MARKETPLACE_PROFILES, type MarketplaceId } from "../../../lib/marketplace-profiles";

interface MarketplaceSelectorProps {
  selectedMarketplace: MarketplaceId | null;
  onSelect: (id: MarketplaceId) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

/** Group marketplaces by platform for the UI */
const MARKETPLACE_GROUPS = [
  {
    label: "Amazon",
    icon: ShoppingBag,
    marketplaces: ["amazon_de", "amazon_fr", "amazon_es", "amazon_it", "amazon_jp"] as MarketplaceId[],
  },
  {
    label: "Shopify",
    icon: Store,
    marketplaces: ["shopify_international"] as MarketplaceId[],
  },
  {
    label: "Etsy",
    icon: Globe,
    marketplaces: ["etsy_international"] as MarketplaceId[],
  },
];

/** Languages available per marketplace locale */
const MARKETPLACE_LANGUAGES: Record<string, string[]> = {
  amazon_de: ["German"],
  amazon_fr: ["French"],
  amazon_es: ["Spanish"],
  amazon_it: ["Italian"],
  amazon_jp: ["Japanese"],
  shopify_international: [
    "German", "French", "Spanish", "Italian", "Japanese", "Portuguese",
    "Chinese (Simplified)", "Korean", "Dutch", "Swedish", "Danish",
    "Norwegian", "Finnish", "Polish", "Czech", "Hungarian", "Romanian",
    "Turkish", "Arabic", "Hindi", "Thai", "Vietnamese", "Indonesian",
  ],
  etsy_international: [
    "German", "French", "Spanish", "Italian", "Japanese", "Portuguese",
    "Dutch", "Polish", "Swedish", "Danish", "Norwegian", "Finnish",
  ],
};

export default function MarketplaceSelector({
  selectedMarketplace,
  onSelect,
  selectedLanguage,
  onLanguageChange,
}: MarketplaceSelectorProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const availableLanguages = selectedMarketplace
    ? MARKETPLACE_LANGUAGES[selectedMarketplace] || []
    : [];

  const handleMarketplaceSelect = (id: MarketplaceId) => {
    onSelect(id);
    // Auto-select the first (or only) language for this marketplace
    const langs = MARKETPLACE_LANGUAGES[id] || [];
    if (langs.length === 1) {
      onLanguageChange(langs[0]);
    } else if (!langs.includes(selectedLanguage)) {
      onLanguageChange(langs[0] || "");
    }
  };

  return (
    <div className="space-y-4">
      {/* Marketplace groups */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
          Target Marketplace
        </label>

        <div className="space-y-2">
          {MARKETPLACE_GROUPS.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroup === group.label || group.marketplaces.length === 1;
            const hasSelection = group.marketplaces.includes(selectedMarketplace as MarketplaceId);

            return (
              <div key={group.label} className="border border-gray-800 rounded-xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => {
                    if (group.marketplaces.length === 1) {
                      handleMarketplaceSelect(group.marketplaces[0]);
                    } else {
                      setExpandedGroup(expandedGroup === group.label ? null : group.label);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
                    hasSelection
                      ? "bg-yellow-400/10 border-yellow-400/30"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <Icon size={16} className={hasSelection ? "text-yellow-400" : "text-gray-500"} />
                  <span className={`text-sm font-bold flex-grow ${hasSelection ? "text-white" : "text-gray-400"}`}>
                    {group.label}
                  </span>
                  {hasSelection && <Check size={14} className="text-yellow-400" />}
                  {group.marketplaces.length > 1 && (
                    <span className="text-xs text-gray-600">
                      {group.marketplaces.length} markets
                    </span>
                  )}
                </button>

                {/* Expanded marketplace list */}
                {isExpanded && group.marketplaces.length > 1 && (
                  <div className="border-t border-gray-800 bg-black/30">
                    {group.marketplaces.map((id) => {
                      const profile = MARKETPLACE_PROFILES[id];
                      const isSelected = selectedMarketplace === id;

                      return (
                        <button
                          key={id}
                          onClick={() => handleMarketplaceSelect(id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                            isSelected
                              ? "bg-yellow-400 text-black"
                              : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                          }`}
                        >
                          <span className="text-sm">{profile.name}</span>
                          <span className="text-xs opacity-60 ml-auto">{profile.locale}</span>
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Language selector (for multi-language marketplaces like Shopify/Etsy) */}
      {selectedMarketplace && availableLanguages.length > 1 && (
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
            Target Language
          </label>
          <div className="max-h-[200px] overflow-y-auto border border-gray-800 rounded-xl bg-black/30 p-1 space-y-0.5">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`w-full text-left text-sm py-2 px-3 rounded-md transition-all flex items-center justify-between ${
                  selectedLanguage === lang
                    ? "bg-yellow-400 text-black font-bold"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                {lang}
                {selectedLanguage === lang && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected marketplace info */}
      {selectedMarketplace && (
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-bold uppercase">Marketplace Rules</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">
              Title: max {MARKETPLACE_PROFILES[selectedMarketplace].titleMaxChars} chars
            </p>
            <p className="text-xs text-gray-400">
              Description: max {MARKETPLACE_PROFILES[selectedMarketplace].descriptionMaxChars} chars
            </p>
            {MARKETPLACE_PROFILES[selectedMarketplace].bulletPointCount > 0 && (
              <p className="text-xs text-gray-400">
                {MARKETPLACE_PROFILES[selectedMarketplace].bulletPointCount} bullet points, max{" "}
                {MARKETPLACE_PROFILES[selectedMarketplace].bulletPointMaxChars} chars each
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
