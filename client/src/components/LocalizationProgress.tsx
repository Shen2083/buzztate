import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, X, Check, AlertTriangle, Circle } from "lucide-react";

export interface MarketplaceProgress {
  marketplaceId: string;
  marketplaceName: string;
  targetLanguage: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  listingsDone: number;
  listingsTotal: number;
}

interface LocalizationProgressProps {
  /** Total listings being processed across all marketplaces */
  totalLocalizations: number;
  /** How many localizations are done so far (across all marketplaces) */
  doneLocalizations: number;
  /** Title of the listing currently being processed */
  currentTitle?: string;
  /** True while the localization is in progress */
  isRunning: boolean;
  /** Called when user clicks Cancel */
  onCancel: () => void;
  /** Per-marketplace progress entries */
  marketplaceProgress: MarketplaceProgress[];
  /** Number of successful results */
  successCount?: number;
  /** Number of warnings */
  warningCount?: number;
  /** Number of failures */
  failCount?: number;
  /** Whether the job completed (vs cancelled mid-way) */
  completed?: boolean;
  /** Was the job cancelled? */
  cancelled?: boolean;
  /** Called to start over */
  onStartOver?: () => void;
  /** Is this a single-marketplace run? (legacy mode) */
  isSingleMarketplace?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LocalizationProgress({
  totalLocalizations,
  doneLocalizations,
  currentTitle,
  isRunning,
  onCancel,
  marketplaceProgress,
  successCount = 0,
  warningCount = 0,
  failCount = 0,
  completed = false,
  cancelled = false,
  onStartOver,
  isSingleMarketplace = false,
}: LocalizationProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const startTime = useRef(Date.now());
  const slowTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isRunning) return;
    startTime.current = Date.now();
    setElapsed(0);
    setShowSlowHint(false);

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    slowTimer.current = setTimeout(() => setShowSlowHint(true), 10_000);

    return () => {
      clearInterval(interval);
      if (slowTimer.current) clearTimeout(slowTimer.current);
    };
  }, [isRunning]);

  // Rolling speed: track timestamps of last 10 completions
  const completionTimesRef = useRef<number[]>([]);
  const prevDoneRef = useRef(0);

  useEffect(() => {
    if (doneLocalizations > 0) setShowSlowHint(false);
    // Record timestamp for each new completion
    if (doneLocalizations > prevDoneRef.current) {
      const now = Date.now();
      const newCompletions = doneLocalizations - prevDoneRef.current;
      for (let i = 0; i < newCompletions; i++) {
        completionTimesRef.current.push(now);
      }
      // Keep only last 10
      if (completionTimesRef.current.length > 10) {
        completionTimesRef.current = completionTimesRef.current.slice(-10);
      }
    }
    prevDoneRef.current = doneLocalizations;
  }, [doneLocalizations]);

  // Reset on new run
  useEffect(() => {
    if (isRunning) {
      completionTimesRef.current = [];
      prevDoneRef.current = 0;
    }
  }, [isRunning]);

  const percent = totalLocalizations > 0 ? Math.round((doneLocalizations / totalLocalizations) * 100) : 0;

  // Rolling speed (items/sec) from last 10 completions
  const rollingSpeed = (() => {
    const times = completionTimesRef.current;
    if (times.length < 2) return 0;
    const timeSpan = (times[times.length - 1] - times[0]) / 1000;
    if (timeSpan <= 0) return 0;
    return (times.length - 1) / timeSpan;
  })();

  // ETA based on rolling speed (more responsive than overall average)
  const estimatedRemaining =
    rollingSpeed > 0 && isRunning
      ? Math.round((totalLocalizations - doneLocalizations) / rollingSpeed)
      : doneLocalizations > 0 && isRunning
        ? Math.round((elapsed / doneLocalizations) * (totalLocalizations - doneLocalizations))
        : 0;

  const currentMarketplace = marketplaceProgress.find((m) => m.status === "in_progress");
  const completedMarketplaces = marketplaceProgress.filter((m) => m.status === "completed");
  const marketplaceCount = marketplaceProgress.length;
  const currentMarketplaceIndex = completedMarketplaces.length + 1;

  // Completed or cancelled state
  if (completed || cancelled) {
    const totalMarkets = marketplaceProgress.length;
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <div className="text-center">
          {completed && failCount === 0 && (
            <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-400" />
            </div>
          )}
          {completed && failCount > 0 && (
            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
          )}
          {cancelled && (
            <div className="w-14 h-14 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={28} className="text-gray-400" />
            </div>
          )}

          <h3 className="text-lg font-bold text-white mb-2">
            {cancelled
              ? "Localization cancelled"
              : "Localization complete!"}
          </h3>

          <p className="text-sm text-gray-400 mb-4">
            {cancelled
              ? `${doneLocalizations} of ${totalLocalizations} localizations were completed.${completedMarketplaces.length > 0 ? ` ${completedMarketplaces.length} marketplace${completedMarketplaces.length !== 1 ? "s" : ""} fully completed.` : ""}`
              : isSingleMarketplace
                ? `${successCount} listing${successCount !== 1 ? "s" : ""} localized for ${marketplaceProgress[0]?.marketplaceName}.`
                : `${doneLocalizations} listings localized across ${totalMarkets} marketplace${totalMarkets !== 1 ? "s" : ""}`}
          </p>

          {/* Per-marketplace breakdown (multi-marketplace only) */}
          {!isSingleMarketplace && marketplaceProgress.length > 1 && (
            <div className="mb-4 space-y-1 text-left max-w-sm mx-auto">
              {marketplaceProgress.map((mp) => (
                <div key={mp.marketplaceId} className="flex items-center gap-2 text-xs">
                  {mp.status === "completed" ? (
                    <Check size={12} className="text-green-400 flex-shrink-0" />
                  ) : mp.status === "cancelled" ? (
                    <X size={12} className="text-gray-500 flex-shrink-0" />
                  ) : (
                    <Circle size={12} className="text-gray-600 flex-shrink-0" />
                  )}
                  <span className={mp.status === "completed" ? "text-gray-300" : "text-gray-500"}>
                    {mp.marketplaceName}
                  </span>
                  <span className="text-gray-600 ml-auto">
                    {mp.listingsDone}/{mp.listingsTotal}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Summary badges */}
          <div className="flex justify-center gap-3 mb-6">
            {successCount > 0 && (
              <span className="text-xs bg-green-400/10 text-green-400 px-3 py-1 rounded-full font-bold">
                {successCount} successful
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-xs bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full font-bold">
                {warningCount} warning{warningCount !== 1 ? "s" : ""}
              </span>
            )}
            {failCount > 0 && (
              <span className="text-xs bg-red-400/10 text-red-400 px-3 py-1 rounded-full font-bold">
                {failCount} failed
              </span>
            )}
          </div>

          {failCount > 0 && completed && (
            <p className="text-xs text-gray-500 mb-4">
              Some listings couldn't be localized. They've been marked in the export file so you can retry them.
            </p>
          )}

          {onStartOver && (
            <button
              onClick={onStartOver}
              className="text-sm text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
            >
              Localize More
            </button>
          )}
        </div>
      </div>
    );
  }

  // In-progress state
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          {isSingleMarketplace ? (
            <>
              <h3 className="text-sm font-bold text-white">
                Localizing {currentMarketplace?.listingsTotal || 0} listing{(currentMarketplace?.listingsTotal || 0) !== 1 ? "s" : ""} into {currentMarketplace?.targetLanguage}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{currentMarketplace?.marketplaceName}</p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-white">
                Localizing into {currentMarketplace?.targetLanguage} ({currentMarketplaceIndex} of {marketplaceCount} marketplaces)
              </h3>
              <p className="text-xs text-gray-500 mt-1">{currentMarketplace?.marketplaceName}</p>
            </>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-400/5"
        >
          <X size={12} />
          Cancel
        </button>
      </div>

      {/* Per-marketplace progress list (multi-marketplace only) */}
      {!isSingleMarketplace && marketplaceProgress.length > 1 && (
        <div className="mb-4 space-y-1.5">
          {marketplaceProgress.map((mp) => (
            <div key={mp.marketplaceId} className="flex items-center gap-2 text-xs">
              {mp.status === "completed" ? (
                <Check size={12} className="text-green-400 flex-shrink-0" />
              ) : mp.status === "in_progress" ? (
                <Loader2 size={12} className="text-yellow-400 animate-spin flex-shrink-0" />
              ) : (
                <Circle size={12} className="text-gray-700 flex-shrink-0" />
              )}
              <span className={
                mp.status === "completed" ? "text-green-400" :
                mp.status === "in_progress" ? "text-white font-medium" :
                "text-gray-600"
              }>
                {mp.status === "completed"
                  ? `${mp.targetLanguage} — ${mp.listingsDone} listings complete`
                  : mp.status === "in_progress"
                    ? `${mp.targetLanguage} — Localizing listing ${mp.listingsDone + 1} of ${mp.listingsTotal}...`
                    : `${mp.targetLanguage} — Pending`
                }
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Current marketplace progress bar */}
      {currentMarketplace && (
        <div className="mb-3">
          <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentMarketplace.listingsTotal > 0 ? Math.round((currentMarketplace.listingsDone / currentMarketplace.listingsTotal) * 100) : 0}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-600 mt-1">
            <span>Listing {currentMarketplace.listingsDone + 1} of {currentMarketplace.listingsTotal}</span>
            {currentTitle && (
              <span className="truncate ml-4 max-w-[200px]">{currentTitle}</span>
            )}
          </div>
        </div>
      )}

      {/* Overall progress */}
      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
        <span>Processing: {doneLocalizations} of {totalLocalizations} localizations</span>
        <div className="flex gap-4">
          {rollingSpeed > 0 && (
            <span>~{rollingSpeed.toFixed(1)} listings/sec</span>
          )}
          <span>Elapsed: {formatTime(elapsed)}</span>
          {doneLocalizations > 0 && doneLocalizations < totalLocalizations && (
            <span>~{formatTime(estimatedRemaining)} remaining</span>
          )}
        </div>
      </div>

      {/* Current listing */}
      <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-gray-800">
        <Loader2 size={16} className="text-yellow-400 animate-spin flex-shrink-0" />
        <div className="min-w-0 flex-grow">
          <p className="text-xs text-gray-400">
            {currentMarketplace
              ? `Localizing for ${currentMarketplace.marketplaceName}`
              : "Preparing..."}
          </p>
          {currentTitle && (
            <p className="text-xs text-gray-300 truncate mt-0.5 font-medium">
              {currentTitle}
            </p>
          )}
        </div>
      </div>

      {/* Slow connection hint */}
      {showSlowHint && doneLocalizations === 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          This is taking a bit longer than usual. Hang tight...
        </p>
      )}
    </div>
  );
}
