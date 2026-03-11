import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, History, Clock, Copy, LogOut, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { ColumnMapping, ParsedListing, LocalizationResultItem } from "@shared/schema";
import type { MarketplaceId } from "../../../lib/marketplace-profiles";
import { MARKETPLACE_PROFILES } from "../../../lib/marketplace-profiles";
import { parseUploadedFile, applyColumnMappings, type ParsedFileResult } from "@/lib/file-parser-client";
import { fetchWithRetry, parseApiError, networkError } from "@/lib/api-error";
import FileUpload from "@/components/FileUpload";
import ColumnMapper from "@/components/ColumnMapper";
import MarketplaceSelector from "@/components/MarketplaceSelector";
import ExportPanel from "@/components/ExportPanel";
import type { MultiMarketplaceResults } from "@/components/ExportPanel";
import LocalizationProgress from "@/components/LocalizationProgress";
import type { MarketplaceProgress } from "@/components/LocalizationProgress";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    };
  }
  return { "Content-Type": "application/json" };
}

/** Map each marketplace to its target language for localization */
const MARKETPLACE_TARGET_LANGUAGE: Record<string, string> = {
  amazon_de: "German",
  amazon_fr: "French",
  amazon_es: "Spanish",
  amazon_it: "Italian",
  amazon_jp: "Japanese",
  shopify_international: "", // User must select
  etsy_international: "",    // User must select
};

export default function Home({ session }: { session: any }) {
  const [isPro, setIsPro] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const usageLimit = 5; // Free tier monthly cap
  const [showHistory, setShowHistory] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- Listing Localization state ---
  const [parsedFile, setParsedFile] = useState<ParsedFileResult | null>(null);
  const [confirmedMappings, setConfirmedMappings] = useState<ColumnMapping[] | null>(null);
  const [parsedListings, setParsedListings] = useState<ParsedListing[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<MarketplaceId[]>([]);
  const [localizeLoading, setLocalizeLoading] = useState(false);
  const [localizeCancelled, setLocalizeCancelled] = useState(false);
  const [localizeCompleted, setLocalizeCompleted] = useState(false);
  const [currentListingTitle, setCurrentListingTitle] = useState("");
  const [fileParseLoading, setFileParseLoading] = useState(false);
  const [fileParseError, setFileParseError] = useState<string | null>(null);
  const cancelRef = useRef(false);
  const MAX_BATCH_SIZE = 200;
  const FREE_TIER_LIMIT = 5;

  // Multi-marketplace progress tracking
  const [marketplaceProgressList, setMarketplaceProgressList] = useState<MarketplaceProgress[]>([]);
  const [multiResults, setMultiResults] = useState<MultiMarketplaceResults>({});
  const [totalLocalizations, setTotalLocalizations] = useState(0);
  const [doneLocalizations, setDoneLocalizations] = useState(0);

  // 1. CHECK PRO STATUS & VERIFY PAYMENT
  useEffect(() => {
    const checkStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro, plan_tier, listings_used_this_month, cancel_at_period_end, current_period_end')
        .eq('id', session.user.id)
        .single();

      if (error && !data) {
        const { data: fallback } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', session.user.id)
          .single();
        if (fallback?.is_pro) {
          setIsPro(true);
        }
      } else if (data) {
        if (data.is_pro) {
          setIsPro(true);
        }
        setUsageCount(data.listings_used_this_month || 0);
        setCancelAtPeriodEnd(data.cancel_at_period_end || false);
        setCurrentPeriodEnd(data.current_period_end || null);
      }

      // Verify Payment via Session ID
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (sessionId && !isPro) {
        setVerifyingPayment(true);
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId })
          });
          const result = await res.json();

          if (result.success) {
            setIsPro(true);
            toast({
              title: "Welcome to Plus!",
              description: "You now have unlimited listings and all marketplaces.",
            });
            window.history.replaceState({}, '', window.location.pathname);
          } else {
            toast({
              title: "Verifying payment...",
              description: "Payment verification is taking longer than expected. Your Plus features will activate within a few minutes.",
            });
          }
        } catch (e) {
          console.error("Verification network error", e);
          toast({
            title: "Connection issue",
            description: "Could not verify payment. Please try refreshing the page.",
            variant: "destructive"
          });
        }
        setVerifyingPayment(false);
      }
    };

    checkStatus();
  }, [session]);

  // 2. FETCH HISTORY
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setHistory(data);
    } catch {
      toast({
        title: "Couldn't load history",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    }
    setHistoryLoading(false);
  };

  // 3. HANDLE BILLING
  const handleBilling = async (plan?: string) => {
    setCheckoutLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        if (!refreshed?.access_token) {
          toast({
            title: "Session expired",
            description: "Please log in again to continue.",
            variant: "destructive"
          });
          setCheckoutLoading(false);
          return;
        }
      }

      const endpoint = isPro ? "/api/portal" : "/api/checkout";
      const headers = await getAuthHeaders();

      let response: Response;
      try {
        response = await fetchWithRetry(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(isPro ? {} : { plan: plan || "plus" }),
        });
      } catch {
        toast({
          title: isPro ? "Couldn't open subscription manager" : "Couldn't connect to payment provider",
          description: isPro ? "Please try again or contact support@buzztate.com." : "Please try again. You haven't been charged.",
          variant: "destructive"
        });
        setCheckoutLoading(false);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        toast({
          title: "Something went wrong",
          description: "Please try again in a few minutes.",
          variant: "destructive"
        });
        setCheckoutLoading(false);
        return;
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        toast({
          title: "Billing error",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Billing error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive"
      });
    }
    setCheckoutLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  // --- Listing Localization handlers ---
  const handleFileSelected = useCallback(async (file: File) => {
    setFileParseLoading(true);
    setFileParseError(null);
    setConfirmedMappings(null);
    setParsedListings([]);
    setMultiResults({});
    setLocalizeCompleted(false);
    setLocalizeCancelled(false);
    try {
      const result = await parseUploadedFile(file);

      if (result.headers.length === 0) {
        setFileParseError("We couldn't read this file. Please check it's a valid .csv, .xlsx, or .tsv file with product listings.");
        setParsedFile(null);
        setFileParseLoading(false);
        return;
      }

      if (result.rows.length === 0) {
        setFileParseError("We found column headers but no product listings. Please check your file has data rows below the headers.");
        setParsedFile(null);
        setFileParseLoading(false);
        return;
      }

      setParsedFile(result);
      toast({
        title: "File parsed",
        description: `Found ${result.rows.length} listing${result.rows.length !== 1 ? "s" : ""} with ${result.headers.length} columns.`,
      });
    } catch (err) {
      setFileParseError("We couldn't read this file. Please check it's a valid .csv, .xlsx, or .tsv file with product listings.");
      setParsedFile(null);
    }
    setFileParseLoading(false);
  }, []);

  const handleMappingsConfirmed = useCallback((mappings: ColumnMapping[]) => {
    if (!parsedFile) return;
    setConfirmedMappings(mappings);
    const listings = applyColumnMappings(parsedFile.rows, mappings);
    setParsedListings(listings);
    toast({
      title: "Columns mapped",
      description: `${listings.length} listing${listings.length !== 1 ? "s" : ""} ready for localization.`,
    });
  }, [parsedFile]);

  const trimToLimit = (limit: number) => {
    setParsedListings((prev) => prev.slice(0, limit));
    toast({
      title: `Trimmed to ${limit}`,
      description: `We'll localize the first ${limit} listings. Upload the rest in a separate batch.`,
    });
  };

  // Batch limit calculations
  const selectedMarketCount = selectedMarketplaces.length;
  const totalLocalizationCount = parsedListings.length * selectedMarketCount;
  const effectiveMaxBatch = isPro ? MAX_BATCH_SIZE : FREE_TIER_LIMIT;
  const exceedsBatchLimit = isPro && totalLocalizationCount > MAX_BATCH_SIZE;
  const maxListingsForBatch = selectedMarketCount > 0 ? Math.floor(MAX_BATCH_SIZE / selectedMarketCount) : MAX_BATCH_SIZE;

  /** Send listings in small chunks to avoid Vercel function timeouts */
  const LOCALIZE_CHUNK_SIZE = 3;

  const handleLocalize = async () => {
    if (parsedListings.length === 0 || selectedMarketplaces.length === 0) {
      toast({
        title: "Missing selection",
        description: "Please upload a file, map columns, and select at least one marketplace.",
        variant: "destructive",
      });
      return;
    }

    // Determine listings to process (respect batch limit)
    let listingsToProcess = parsedListings;
    if (isPro && totalLocalizationCount > MAX_BATCH_SIZE) {
      listingsToProcess = parsedListings.slice(0, maxListingsForBatch);
    } else if (!isPro && parsedListings.length > FREE_TIER_LIMIT) {
      listingsToProcess = parsedListings.slice(0, FREE_TIER_LIMIT);
    }

    const totalCount = listingsToProcess.length * selectedMarketplaces.length;

    cancelRef.current = false;
    setLocalizeLoading(true);
    setMultiResults({});
    setLocalizeCompleted(false);
    setLocalizeCancelled(false);
    setTotalLocalizations(totalCount);
    setDoneLocalizations(0);
    setCurrentListingTitle(listingsToProcess[0]?.title || "");

    // Initialize per-marketplace progress
    const initialProgress: MarketplaceProgress[] = selectedMarketplaces.map((mpId, idx) => ({
      marketplaceId: mpId,
      marketplaceName: MARKETPLACE_PROFILES[mpId]?.name || mpId,
      targetLanguage: MARKETPLACE_TARGET_LANGUAGE[mpId] || mpId,
      status: idx === 0 ? "in_progress" : "pending",
      listingsDone: 0,
      listingsTotal: listingsToProcess.length,
    }));
    setMarketplaceProgressList(initialProgress);

    const allMultiResults: MultiMarketplaceResults = {};
    let globalDone = 0;
    let lastUsage: any = null;
    let failed = false;

    try {
      const authHeaders = await getAuthHeaders();

      // Sequential processing: one marketplace at a time
      for (let mpIdx = 0; mpIdx < selectedMarketplaces.length; mpIdx++) {
        if (cancelRef.current) {
          setLocalizeCancelled(true);
          // Mark remaining marketplaces as cancelled
          setMarketplaceProgressList((prev) =>
            prev.map((mp, i) =>
              i >= mpIdx ? { ...mp, status: "cancelled" as const } : mp
            )
          );
          break;
        }

        const mpId = selectedMarketplaces[mpIdx];
        const targetLanguage = MARKETPLACE_TARGET_LANGUAGE[mpId];

        // Mark this marketplace as in_progress
        setMarketplaceProgressList((prev) =>
          prev.map((mp, i) =>
            i === mpIdx ? { ...mp, status: "in_progress" as const } : mp
          )
        );

        const mpResults: LocalizationResultItem[] = [];

        // Process listings one chunk at a time
        for (let i = 0; i < listingsToProcess.length; i += LOCALIZE_CHUNK_SIZE) {
          if (cancelRef.current) {
            setLocalizeCancelled(true);
            break;
          }

          const chunk = listingsToProcess.slice(i, i + LOCALIZE_CHUNK_SIZE);
          setCurrentListingTitle(chunk[0]?.title || "");

          let response: Response;
          try {
            response = await fetchWithRetry("/api/localize", {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                listings: chunk,
                marketplace: mpId,
                targetLanguage,
                userId: session.user.id,
              }),
            }, 2);
          } catch {
            toast({
              title: "Connection lost",
              description: "We're having trouble connecting. Your uploaded file is still ready — please try again.",
              variant: "destructive",
            });
            failed = true;
            break;
          }

          const data = await response.json();

          if (response.ok && data.results) {
            mpResults.push(...data.results);
            lastUsage = data.usage;
            globalDone += data.results.length;

            // Update per-marketplace progress
            setMarketplaceProgressList((prev) =>
              prev.map((mp, idx) =>
                idx === mpIdx ? { ...mp, listingsDone: mpResults.length } : mp
              )
            );

            setDoneLocalizations(globalDone);
            setCurrentListingTitle(
              i + LOCALIZE_CHUNK_SIZE < listingsToProcess.length
                ? listingsToProcess[i + LOCALIZE_CHUNK_SIZE]?.title || ""
                : ""
            );
          } else {
            const apiErr = parseApiError(response, data);
            toast({
              title: "Localization error",
              description: apiErr?.message || "Something went wrong.",
              variant: "destructive",
            });
            failed = true;
            break;
          }
        }

        // Store results for this marketplace
        if (mpResults.length > 0) {
          allMultiResults[mpId] = { results: mpResults, targetLanguage };
          setMultiResults({ ...allMultiResults });
        }

        if (failed || cancelRef.current) {
          // Mark current + remaining as cancelled
          setMarketplaceProgressList((prev) =>
            prev.map((mp, i) => {
              if (i === mpIdx && mpResults.length === listingsToProcess.length) {
                return { ...mp, status: "completed" as const, listingsDone: mpResults.length };
              }
              if (i >= mpIdx && mp.status !== "completed") {
                return { ...mp, status: "cancelled" as const, listingsDone: i === mpIdx ? mpResults.length : 0 };
              }
              return mp;
            })
          );
          break;
        }

        // Mark this marketplace as completed
        setMarketplaceProgressList((prev) =>
          prev.map((mp, i) =>
            i === mpIdx ? { ...mp, status: "completed" as const, listingsDone: mpResults.length } : mp
          )
        );
      }

      if (!failed && !cancelRef.current) {
        if (lastUsage) {
          setUsageCount(lastUsage.used);
        }
        setLocalizeCompleted(true);
      } else if (cancelRef.current && !failed) {
        setLocalizeCancelled(true);
      }
    } catch (err) {
      toast({
        title: "Localization failed",
        description: "Network error. Your uploaded file is still ready — please try again.",
        variant: "destructive",
      });
    }
    setLocalizeLoading(false);
  };

  const handleCancelLocalize = () => {
    cancelRef.current = true;
  };

  const resetLocalizeFlow = () => {
    setParsedFile(null);
    setConfirmedMappings(null);
    setParsedListings([]);
    setMultiResults({});
    setLocalizeCompleted(false);
    setLocalizeCancelled(false);
    setSelectedMarketplaces([]);
    setFileParseError(null);
    setCurrentListingTitle("");
    setMarketplaceProgressList([]);
    setTotalLocalizations(0);
    setDoneLocalizations(0);
  };

  // Computed values
  const allResultsFlat = Object.values(multiResults).flatMap((m) => m.results);
  const warningCount = allResultsFlat.reduce((s, r) => s + r.qualityFlags.length, 0);
  const isSingleMarketplace = selectedMarketplaces.length === 1;
  const hasMarketplaceSelection = selectedMarketplaces.length > 0;

  // Button label
  const localizeButtonLabel = (() => {
    if (localizeLoading) return null; // handled separately
    if (parsedListings.length === 0) return "Localize Listings";
    if (selectedMarketCount === 0) return `Localize ${parsedListings.length} Listing${parsedListings.length !== 1 ? "s" : ""}`;
    if (selectedMarketCount === 1) return `Localize ${parsedListings.length} Listing${parsedListings.length !== 1 ? "s" : ""}`;
    return `Localize ${parsedListings.length} Listing${parsedListings.length !== 1 ? "s" : ""} × ${selectedMarketCount} Markets`;
  })();

  // ==================== RENDER ====================

  // History view
  if (showHistory) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
        <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-xl hidden sm:block">Buzztate</span>
              <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase ml-1">for Sellers</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
              >
                &larr; Back to Localize
              </button>
              <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors" title="Log Out">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl w-full p-6">
          <h2 className="text-2xl font-bold mb-6">History</h2>
          {historyLoading ? (
            <div className="text-center text-gray-500 py-20 flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-gray-600" />
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-20 border border-gray-800 rounded-2xl bg-gray-900/20">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No localizations found yet.</p>
              <button onClick={() => setShowHistory(false)} className="text-yellow-400 hover:underline mt-2">Start localizing</button>
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((record) => (
                <div key={record.id} className="bg-gray-900/40 border border-gray-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 hover:border-gray-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded uppercase">{record.language}</span>
                      <span className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-500 border border-gray-800 px-2 rounded-full">{record.style}</span>
                    </div>
                    <p className="text-gray-300 font-medium text-lg">{record.translated_text}</p>
                    <p className="text-gray-500 text-sm mt-2 italic">Original: "{record.original_text}"</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCopy(record.translated_text)}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main view — Localize Listings
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">

      {/* App Header */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl hidden sm:block">Buzztate</span>
            <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase ml-1">for Sellers</span>
          </div>

          <div className="flex items-center gap-4">
            {!isPro && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                <span className={usageCount >= usageLimit ? "text-red-400 font-bold" : "text-gray-400"}>
                  {usageCount}/{usageLimit}
                </span>
                localizations this month
              </span>
            )}
            <button
              onClick={() => isPro ? handleBilling() : handleBilling("plus")}
              disabled={checkoutLoading || verifyingPayment}
              className={`text-xs px-3 py-1.5 rounded-full transition-all disabled:opacity-50 border flex items-center gap-2 ${
                isPro
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                  : "bg-gray-800 hover:bg-yellow-400 hover:text-black border-gray-600"
              }`}
            >
              {verifyingPayment ? (
                <>
                  <Loader2 className="animate-spin" size={12} />
                  Verifying...
                </>
              ) : checkoutLoading ? (
                <Loader2 className="animate-spin" size={12} />
              ) : isPro ? (
                "Manage Subscription"
              ) : (
                <>
                  <Zap size={12} />
                  Upgrade to Plus
                </>
              )}
            </button>
            <button
              onClick={() => { setShowHistory(true); fetchHistory(); }}
              className="text-gray-500 hover:text-white transition-colors"
              title="History"
            >
              <History size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Cancellation grace period banner */}
      {isPro && cancelAtPeriodEnd && currentPeriodEnd && (
        <div className="max-w-7xl w-full px-6 mt-4">
          <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4">
            <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-grow">
              <p className="text-sm text-yellow-200 font-medium">
                Your Plus plan is active until {new Date(currentPeriodEnd).toLocaleDateString()}. After that, you'll be on the Free plan.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                You can reactivate anytime from "Manage Subscription" before the period ends.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Localize Listings — main content */}
      <div className="max-w-7xl w-full p-6 mt-2 space-y-6">
        {/* Step indicator */}
        {!localizeLoading && !localizeCompleted && !localizeCancelled && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className={parsedFile ? "text-green-400" : "text-yellow-400 font-bold"}>
              1. Upload File
            </span>
            <span className="text-gray-700">&rarr;</span>
            <span className={confirmedMappings ? "text-green-400" : parsedFile ? "text-yellow-400 font-bold" : ""}>
              2. Map Columns
            </span>
            <span className="text-gray-700">&rarr;</span>
            <span className={hasMarketplaceSelection ? "text-green-400" : confirmedMappings ? "text-yellow-400 font-bold" : ""}>
              3. Pick Marketplace{isPro ? "s" : ""}
            </span>
            <span className="text-gray-700">&rarr;</span>
            <span className={allResultsFlat.length > 0 ? "text-green-400" : ""}>
              4. Localize & Export
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: File upload + column mapping + progress + results */}
          <div className="lg:col-span-8 space-y-6">

            {/* Localization Progress (replaces upload area during processing) */}
            {(localizeLoading || localizeCompleted || localizeCancelled) && (
              <LocalizationProgress
                totalLocalizations={totalLocalizations}
                doneLocalizations={doneLocalizations}
                currentTitle={currentListingTitle}
                isRunning={localizeLoading}
                onCancel={handleCancelLocalize}
                marketplaceProgress={marketplaceProgressList}
                successCount={allResultsFlat.length}
                warningCount={warningCount}
                failCount={totalLocalizations - allResultsFlat.length > 0 && !localizeLoading ? totalLocalizations - allResultsFlat.length : 0}
                completed={localizeCompleted}
                cancelled={localizeCancelled}
                onStartOver={resetLocalizeFlow}
                isSingleMarketplace={isSingleMarketplace}
              />
            )}

            {/* File Upload (hidden during localization) */}
            {!localizeLoading && !localizeCompleted && !localizeCancelled && (
              <FileUpload
                onFileSelected={handleFileSelected}
                isLoading={fileParseLoading}
                parseError={fileParseError}
                onClearError={() => setFileParseError(null)}
              />
            )}

            {/* Column Mapper (after file parsed) */}
            {parsedFile && !confirmedMappings && !localizeLoading && !localizeCompleted && !localizeCancelled && (
              <ColumnMapper
                headers={parsedFile.headers}
                suggestedMappings={parsedFile.suggestedMappings}
                rows={parsedFile.rows}
                onMappingsConfirmed={handleMappingsConfirmed}
              />
            )}

            {/* Parsed listings preview (after columns confirmed, before localization) */}
            {confirmedMappings && parsedListings.length > 0 && !localizeLoading && !localizeCompleted && !localizeCancelled && allResultsFlat.length === 0 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white">
                    {parsedListings.length} Listing{parsedListings.length !== 1 ? "s" : ""} Ready
                  </h3>
                  <button
                    onClick={resetLocalizeFlow}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Start Over
                  </button>
                </div>

                {/* Free tier limit warning */}
                {!isPro && parsedListings.length > FREE_TIER_LIMIT && (
                  <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 mb-3">
                    <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p className="text-sm text-yellow-200 font-medium">
                        Free plan supports {FREE_TIER_LIMIT} listings per batch. This file has {parsedListings.length}.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        We'll process the first {FREE_TIER_LIMIT}. Upgrade to Plus for up to 200 per batch.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => trimToLimit(FREE_TIER_LIMIT)}
                          className="text-xs bg-yellow-400 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors"
                        >
                          Localize first {FREE_TIER_LIMIT}
                        </button>
                        <button
                          onClick={() => handleBilling("plus")}
                          className="text-xs bg-gray-800 text-yellow-400 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                        >
                          Upgrade to Plus
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-marketplace batch limit warning */}
                {isPro && exceedsBatchLimit && selectedMarketCount > 0 && (
                  <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 mb-3">
                    <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p className="text-sm text-yellow-200 font-medium">
                        That's {totalLocalizationCount} localizations (listings × marketplaces). We'll process up to 200 per batch.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Either reduce listings or marketplaces, or we can process the first {maxListingsForBatch} listings across all selected marketplaces.
                      </p>
                      <button
                        onClick={() => trimToLimit(maxListingsForBatch)}
                        className="mt-2 text-xs bg-yellow-400 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors"
                      >
                        Localize first {maxListingsForBatch} × {selectedMarketCount} markets
                      </button>
                    </div>
                  </div>
                )}

                {/* Simple Plus batch limit warning (single marketplace) */}
                {isPro && !exceedsBatchLimit && parsedListings.length > MAX_BATCH_SIZE && (
                  <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 mb-3">
                    <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p className="text-sm text-yellow-200 font-medium">
                        This file has {parsedListings.length} listings. We'll process the first 200 in this batch.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        You can upload the rest after this batch completes.
                      </p>
                      <button
                        onClick={() => trimToLimit(MAX_BATCH_SIZE)}
                        className="mt-2 text-xs bg-yellow-400 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors"
                      >
                        Localize first 200
                      </button>
                    </div>
                  </div>
                )}

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {parsedListings.slice(0, 10).map((listing, i) => (
                    <div key={i} className="bg-black/30 rounded-lg p-3 border border-gray-800">
                      <p className="text-sm text-white font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {listing.description?.substring(0, 120) || "No description"}
                        {(listing.description?.length || 0) > 120 ? "..." : ""}
                      </p>
                    </div>
                  ))}
                  {parsedListings.length > 10 && (
                    <p className="text-xs text-gray-600 text-center py-2">
                      + {parsedListings.length - 10} more listings
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Export Panel (after localization complete or cancelled with partial results) */}
            {Object.keys(multiResults).length > 0 && (localizeCompleted || localizeCancelled) && (
              <ExportPanel
                multiResults={multiResults}
                originalRows={parsedFile?.rows}
                isSingleMarketplace={isSingleMarketplace}
              />
            )}
          </div>

          {/* Right: Marketplace selector + localize button */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
              <MarketplaceSelector
                selectedMarketplaces={selectedMarketplaces}
                onSelect={setSelectedMarketplaces}
                isPro={isPro}
              />

              <button
                onClick={handleLocalize}
                disabled={localizeLoading || parsedListings.length === 0 || selectedMarketplaces.length === 0 || !navigator.onLine}
                className="w-full bg-yellow-400 text-black font-extrabold py-5 rounded-xl hover:bg-yellow-300 disabled:bg-gray-800 disabled:text-gray-500 transition-all text-lg flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
              >
                {localizeLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Localizing...
                  </>
                ) : (
                  <>
                    <Zap size={18} fill="black" />
                    {localizeButtonLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
