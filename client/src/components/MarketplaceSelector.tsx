import { useState } from "react";
import { Check, Globe, ShoppingBag, Store, Lock, Zap, Square, CheckSquare, MinusSquare } from "lucide-react";
import { MARKETPLACE_PROFILES, type MarketplaceId } from "../../../lib/marketplace-profiles";

/** The first marketplace is free; the rest require Plus */
const FREE_MARKETPLACE: MarketplaceId = "amazon_de";

interface MarketplaceSelectorProps {
  selectedMarketplaces: MarketplaceId[];
  onSelect: (ids: MarketplaceId[]) => void;
  isPro?: boolean;
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

/** All Amazon marketplace IDs */
const ALL_AMAZON_MARKETPLACES: MarketplaceId[] = ["amazon_de", "amazon_fr", "amazon_es", "amazon_it", "amazon_jp"];

export default function MarketplaceSelector({
  selectedMarketplaces,
  onSelect,
  isPro = false,
}: MarketplaceSelectorProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showLockedHint, setShowLockedHint] = useState(false);

  const isMarketplaceLocked = (id: MarketplaceId) => !isPro && id !== FREE_MARKETPLACE;

  const toggleMarketplace = (id: MarketplaceId) => {
    if (isMarketplaceLocked(id)) {
      setShowLockedHint(true);
      setTimeout(() => setShowLockedHint(false), 3000);
      return;
    }

    if (!isPro) {
      // Free users: single-select only
      if (selectedMarketplaces.includes(id)) {
        onSelect([]);
      } else {
        onSelect([id]);
      }
      return;
    }

    // Plus users: multi-select
    if (selectedMarketplaces.includes(id)) {
      onSelect(selectedMarketplaces.filter((m) => m !== id));
    } else {
      onSelect([...selectedMarketplaces, id]);
    }
  };

  const handleSelectAll = () => {
    if (!isPro) return;
    const allUnlocked = ALL_AMAZON_MARKETPLACES; // all are unlocked for Plus
    const allSelected = allUnlocked.every((id) => selectedMarketplaces.includes(id));
    if (allSelected) {
      // Deselect all Amazon marketplaces
      onSelect(selectedMarketplaces.filter((id) => !allUnlocked.includes(id)));
    } else {
      // Select all Amazon marketplaces (keep any non-Amazon selections)
      const nonAmazon = selectedMarketplaces.filter((id) => !allUnlocked.includes(id));
      onSelect([...nonAmazon, ...allUnlocked]);
    }
  };

  const allAmazonSelected = ALL_AMAZON_MARKETPLACES.every((id) => selectedMarketplaces.includes(id));
  const someAmazonSelected = ALL_AMAZON_MARKETPLACES.some((id) => selectedMarketplaces.includes(id)) && !allAmazonSelected;

  return (
    <div className="space-y-4">
      {/* Marketplace groups */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
          Target Marketplace{isPro ? "s" : ""}
        </label>

        {showLockedHint && (
          <div className="mb-3 flex items-center gap-2 text-xs bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-2.5 text-yellow-300 animate-in fade-in">
            <Zap size={12} className="text-yellow-400 flex-shrink-0" />
            <span>Upgrade to Plus to localize into all marketplaces.</span>
          </div>
        )}

        {/* Selection count */}
        {selectedMarketplaces.length > 0 && (
          <div className="mb-3 text-xs text-gray-400">
            <span className="text-yellow-400 font-bold">{selectedMarketplaces.length}</span>{" "}
            marketplace{selectedMarketplaces.length !== 1 ? "s" : ""} selected
          </div>
        )}

        <div className="space-y-2">
          {MARKETPLACE_GROUPS.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroup === group.label || group.marketplaces.length === 1;
            const selectedInGroup = group.marketplaces.filter((id) => selectedMarketplaces.includes(id));
            const hasSelection = selectedInGroup.length > 0;
            const groupLocked = group.marketplaces.every((id) => isMarketplaceLocked(id));

            return (
              <div key={group.label} className="border border-gray-800 rounded-xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => {
                    if (group.marketplaces.length === 1) {
                      toggleMarketplace(group.marketplaces[0]);
                    } else {
                      setExpandedGroup(expandedGroup === group.label ? null : group.label);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
                    groupLocked
                      ? "text-gray-600 cursor-not-allowed"
                      : hasSelection
                        ? "bg-yellow-400/10 border-yellow-400/30"
                        : "hover:bg-gray-800/50"
                  }`}
                >
                  {/* Checkbox for single-marketplace groups */}
                  {group.marketplaces.length === 1 && !groupLocked && (
                    hasSelection
                      ? <CheckSquare size={16} className="text-yellow-400" />
                      : <Square size={16} className="text-gray-600" />
                  )}
                  {group.marketplaces.length > 1 && !groupLocked && hasSelection && (
                    <span className="text-xs bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {selectedInGroup.length}
                    </span>
                  )}
                  {group.marketplaces.length > 1 && !groupLocked && !hasSelection && (
                    <Icon size={16} className="text-gray-500" />
                  )}
                  {groupLocked && <Icon size={16} className="text-gray-500" />}
                  <span className={`text-sm font-bold flex-grow ${hasSelection && !groupLocked ? "text-white" : "text-gray-400"}`}>
                    {group.label}
                  </span>
                  {groupLocked && (
                    <span className="flex items-center gap-1">
                      <Lock size={10} className="text-gray-600" />
                      <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded font-bold">Plus</span>
                    </span>
                  )}
                  {group.marketplaces.length > 1 && !groupLocked && (
                    <span className="text-xs text-gray-600">
                      {group.marketplaces.length} markets
                    </span>
                  )}
                </button>

                {/* Expanded marketplace list */}
                {isExpanded && group.marketplaces.length > 1 && (
                  <div className="border-t border-gray-800 bg-black/30">
                    {/* Select All for this group (Plus only) */}
                    {isPro && group.label === "Amazon" && (
                      <button
                        onClick={handleSelectAll}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left transition-all text-gray-400 hover:bg-gray-800/50 hover:text-white border-b border-gray-800/50"
                      >
                        {allAmazonSelected
                          ? <CheckSquare size={14} className="text-yellow-400" />
                          : someAmazonSelected
                            ? <MinusSquare size={14} className="text-yellow-400" />
                            : <Square size={14} className="text-gray-600" />
                        }
                        <span className="text-xs font-bold uppercase tracking-wider">Select All</span>
                      </button>
                    )}
                    {group.marketplaces.map((id) => {
                      const profile = MARKETPLACE_PROFILES[id];
                      const isSelected = selectedMarketplaces.includes(id);
                      const locked = isMarketplaceLocked(id);

                      return (
                        <button
                          key={id}
                          onClick={() => toggleMarketplace(id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                            locked
                              ? "text-gray-600 cursor-not-allowed"
                              : isSelected
                                ? "bg-yellow-400/10 text-white"
                                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                          }`}
                        >
                          {!locked && (
                            isSelected
                              ? <CheckSquare size={14} className="text-yellow-400" />
                              : <Square size={14} className="text-gray-600" />
                          )}
                          <span className="text-sm">{profile.name}</span>
                          <span className="text-xs opacity-60 ml-auto">{profile.locale}</span>
                          {locked && (
                            <span className="flex items-center gap-1">
                              <Lock size={10} className="text-gray-600" />
                              <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded font-bold">Plus</span>
                            </span>
                          )}
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

      {/* Selected marketplace rules summary */}
      {selectedMarketplaces.length === 1 && (
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-bold uppercase">Marketplace Rules</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">
              Title: max {MARKETPLACE_PROFILES[selectedMarketplaces[0]].titleMaxChars} chars
            </p>
            <p className="text-xs text-gray-400">
              Description: max {MARKETPLACE_PROFILES[selectedMarketplaces[0]].descriptionMaxChars} chars
            </p>
            {MARKETPLACE_PROFILES[selectedMarketplaces[0]].bulletPointCount > 0 && (
              <p className="text-xs text-gray-400">
                {MARKETPLACE_PROFILES[selectedMarketplaces[0]].bulletPointCount} bullet points, max{" "}
                {MARKETPLACE_PROFILES[selectedMarketplaces[0]].bulletPointMaxChars} chars each
              </p>
            )}
          </div>
        </div>
      )}

      {selectedMarketplaces.length > 1 && (
        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-bold uppercase">Selected Marketplaces</p>
          <div className="space-y-1">
            {selectedMarketplaces.map((id) => (
              <p key={id} className="text-xs text-gray-400">
                {MARKETPLACE_PROFILES[id].name} — {MARKETPLACE_PROFILES[id].locale}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
