import { useState, useEffect, useRef } from "react";
import { Loader2, X, Check, AlertTriangle, Download } from "lucide-react";

interface LocalizationProgressProps {
  /** Total listings being processed */
  total: number;
  /** How many are done so far */
  done: number;
  /** Title of the listing currently being processed */
  currentTitle?: string;
  /** True while the localization is in progress */
  isRunning: boolean;
  /** Called when user clicks Cancel */
  onCancel: () => void;
  /** Marketplace display name */
  marketplace: string;
  /** Target language */
  targetLanguage: string;
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
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LocalizationProgress({
  total,
  done,
  currentTitle,
  isRunning,
  onCancel,
  marketplace,
  targetLanguage,
  successCount = 0,
  warningCount = 0,
  failCount = 0,
  completed = false,
  cancelled = false,
  onStartOver,
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

    // Show slow hint after 10 seconds
    slowTimer.current = setTimeout(() => setShowSlowHint(true), 10_000);

    return () => {
      clearInterval(interval);
      if (slowTimer.current) clearTimeout(slowTimer.current);
    };
  }, [isRunning]);

  // Hide slow hint once first result comes in
  useEffect(() => {
    if (done > 0) setShowSlowHint(false);
  }, [done]);

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const estimatedRemaining =
    done > 0 && isRunning
      ? Math.round((elapsed / done) * (total - done))
      : 0;

  // Completed or cancelled state
  if (completed || cancelled) {
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
              ? `${done} of ${total} listings were completed. You can download partial results or start again.`
              : `${successCount} listing${successCount !== 1 ? "s" : ""} localized into ${targetLanguage} for ${marketplace}.`}
          </p>

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
          <h3 className="text-sm font-bold text-white">
            Localizing {total} listing{total !== 1 ? "s" : ""} into {targetLanguage}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{marketplace}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-400/5"
        >
          <X size={12} />
          Cancel
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-3 overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
        <span>{percent}% complete ({done}/{total})</span>
        <div className="flex gap-4">
          <span>Elapsed: {formatTime(elapsed)}</span>
          {done > 0 && done < total && (
            <span>~{formatTime(estimatedRemaining)} remaining</span>
          )}
        </div>
      </div>

      {/* Current listing */}
      <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-gray-800">
        <Loader2 size={16} className="text-yellow-400 animate-spin flex-shrink-0" />
        <div className="min-w-0 flex-grow">
          <p className="text-xs text-gray-400">
            Localizing listing {done + 1} of {total}
          </p>
          {currentTitle && (
            <p className="text-xs text-gray-300 truncate mt-0.5 font-medium">
              {currentTitle}
            </p>
          )}
        </div>
      </div>

      {/* Slow connection hint */}
      {showSlowHint && done === 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          This is taking a bit longer than usual. Hang tight...
        </p>
      )}
    </div>
  );
}
