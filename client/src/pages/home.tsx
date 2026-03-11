import { useState, useEffect, useCallback } from "react";
import { Zap, History, Clock, Copy, LogOut, Loader2, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { ColumnMapping, ParsedListing, LocalizationResultItem } from "@shared/schema";
import type { MarketplaceId } from "../../../lib/marketplace-profiles";
import { parseUploadedFile, applyColumnMappings, type ParsedFileResult } from "@/lib/file-parser-client";
import FileUpload from "@/components/FileUpload";
import ColumnMapper from "@/components/ColumnMapper";
import MarketplaceSelector from "@/components/MarketplaceSelector";
import ExportPanel from "@/components/ExportPanel";

/**
 * Helper to get the current access token for API requests.
 * Uses JWT instead of trusting X-User-ID header.
 */
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

export default function Home({ session }: { session: any }) {
  const [isPro, setIsPro] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const usageLimit = 5; // Free tier monthly cap
  const [showHistory, setShowHistory] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- Listing Localization state ---
  const [parsedFile, setParsedFile] = useState<ParsedFileResult | null>(null);
  const [confirmedMappings, setConfirmedMappings] = useState<ColumnMapping[] | null>(null);
  const [parsedListings, setParsedListings] = useState<ParsedListing[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceId | null>(null);
  const [selectedLocalizeLang, setSelectedLocalizeLang] = useState("");
  const [localizeResults, setLocalizeResults] = useState<LocalizationResultItem[]>([]);
  const [localizeLoading, setLocalizeLoading] = useState(false);
  const [localizeProgress, setLocalizeProgress] = useState({ done: 0, total: 0 });
  const [fileParseLoading, setFileParseLoading] = useState(false);
  const MAX_BATCH_SIZE = 200;

  // 1. CHECK PRO STATUS & VERIFY PAYMENT
  useEffect(() => {
    const checkStatus = async () => {
      // Fetch profile — use is_pro as primary field (always exists),
      // plan_tier and listings_used_this_month may not exist if migration hasn't run yet.
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro, plan_tier, listings_used_this_month')
        .eq('id', session.user.id)
        .single();

      // If the query fails (e.g. columns don't exist yet), fall back to is_pro only
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
      }

      // Verify Payment via Session ID
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (sessionId && !isPro) {
        console.log("Verifying payment session...");
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
              title: "Payment Verified!",
              description: "You're now on the Plus plan. Enjoy all features!",
            });
            window.history.replaceState({}, '', window.location.pathname);
          } else {
            console.error("Verification failed:", result);
            toast({
              title: "Verification Issue",
              description: "Payment verification pending. Please refresh if needed.",
              variant: "destructive"
            });
          }
        } catch (e) {
          console.error("Verification network error", e);
          toast({
            title: "Connection Error",
            description: "Could not verify payment. Please try refreshing.",
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
    const { data } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setHistory(data);
    setHistoryLoading(false);
  };

  // 3. HANDLE CHECKOUT
  const handleBilling = async (plan?: string) => {
    setCheckoutLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        if (!refreshed?.access_token) {
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive"
          });
          setCheckoutLoading(false);
          return;
        }
      }

      const endpoint = isPro ? "/api/portal" : "/api/checkout";
      const headers = await getAuthHeaders();

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(isPro ? {} : { plan: plan || "plus" }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response from", endpoint, response.status, text);
        toast({
          title: "Server Error",
          description: response.ok
            ? "Unexpected response from server. Please try again."
            : `Server returned ${response.status}. Please try again later.`,
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
          title: "Billing Error",
          description: data.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Could not connect to billing server.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Billing error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  // --- Listing Localization handlers ---
  const handleFileSelected = useCallback(async (file: File) => {
    setFileParseLoading(true);
    setConfirmedMappings(null);
    setParsedListings([]);
    setLocalizeResults([]);
    try {
      const result = await parseUploadedFile(file);
      setParsedFile(result);
      toast({
        title: "File Parsed",
        description: `Found ${result.rows.length} rows and ${result.headers.length} columns.`,
      });
    } catch (err) {
      toast({
        title: "Parse Error",
        description: "Could not parse this file. Please check the format.",
        variant: "destructive",
      });
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
      title: "Columns Mapped",
      description: `${listings.length} listings ready for localization.`,
    });
  }, [parsedFile]);

  const trimToMaxBatch = () => {
    setParsedListings((prev) => prev.slice(0, MAX_BATCH_SIZE));
    toast({
      title: "Trimmed to 200",
      description: "We'll localize the first 200 listings. Upload the rest in a separate batch.",
    });
  };

  /** Send listings in small chunks to avoid Vercel function timeouts */
  const LOCALIZE_CHUNK_SIZE = 3;

  const handleLocalize = async () => {
    if (parsedListings.length === 0 || !selectedMarketplace || !selectedLocalizeLang) {
      toast({
        title: "Missing Selection",
        description: "Please upload a file, map columns, and select a marketplace + language.",
        variant: "destructive",
      });
      return;
    }

    setLocalizeLoading(true);
    setLocalizeResults([]);
    setLocalizeProgress({ done: 0, total: parsedListings.length });

    const allResults: LocalizationResultItem[] = [];
    let lastUsage: any = null;
    let failed = false;

    try {
      const authHeaders = await getAuthHeaders();

      for (let i = 0; i < parsedListings.length; i += LOCALIZE_CHUNK_SIZE) {
        const chunk = parsedListings.slice(i, i + LOCALIZE_CHUNK_SIZE);

        const response = await fetch("/api/localize", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            listings: chunk,
            marketplace: selectedMarketplace,
            targetLanguage: selectedLocalizeLang,
            userId: session.user.id,
          }),
        });

        const data = await response.json();

        if (response.ok && data.results) {
          allResults.push(...data.results);
          lastUsage = data.usage;
          setLocalizeProgress({ done: allResults.length, total: parsedListings.length });
          setLocalizeResults([...allResults]);
        } else {
          toast({
            title: "Localization Error",
            description: data.error || "Something went wrong.",
            variant: "destructive",
          });
          failed = true;
          break;
        }
      }

      if (!failed) {
        if (lastUsage) {
          setUsageCount(lastUsage.used);
        }
        const flagCount = allResults.reduce((s: number, r: any) => s + r.qualityFlags.length, 0);
        toast({
          title: "Localization Complete",
          description: `${allResults.length} listings localized.${flagCount > 0 ? ` ${flagCount} quality flag(s).` : ""}`,
        });
      }
    } catch (err) {
      toast({
        title: "Localization Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
    setLocalizeLoading(false);
  };

  const resetLocalizeFlow = () => {
    setParsedFile(null);
    setConfirmedMappings(null);
    setParsedListings([]);
    setLocalizeResults([]);
    setSelectedMarketplace(null);
    setSelectedLocalizeLang("");
  };

  // ==================== RENDER ====================

  // History view
  if (showHistory) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
        {/* Header */}
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
            <div className="text-center text-gray-500 py-20">Loading history...</div>
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
                  Verifying Payment...
                </>
              ) : checkoutLoading ? (
                "..."
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

      {/* Localize Listings — main content */}
      <div className="max-w-7xl w-full p-6 mt-2 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className={parsedFile ? "text-green-400" : "text-yellow-400 font-bold"}>
            1. Upload File
          </span>
          <span className="text-gray-700">&rarr;</span>
          <span className={confirmedMappings ? "text-green-400" : parsedFile ? "text-yellow-400 font-bold" : ""}>
            2. Map Columns
          </span>
          <span className="text-gray-700">&rarr;</span>
          <span className={selectedMarketplace && selectedLocalizeLang ? "text-green-400" : confirmedMappings ? "text-yellow-400 font-bold" : ""}>
            3. Pick Marketplace
          </span>
          <span className="text-gray-700">&rarr;</span>
          <span className={localizeResults.length > 0 ? "text-green-400" : ""}>
            4. Localize & Export
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: File upload + column mapping + results */}
          <div className="lg:col-span-8 space-y-6">
            {/* File Upload */}
            <FileUpload onFileSelected={handleFileSelected} isLoading={fileParseLoading} />

            {/* Column Mapper (after file parsed) */}
            {parsedFile && !confirmedMappings && (
              <ColumnMapper
                headers={parsedFile.headers}
                suggestedMappings={parsedFile.suggestedMappings}
                rows={parsedFile.rows}
                onMappingsConfirmed={handleMappingsConfirmed}
              />
            )}

            {/* Parsed listings preview (after columns confirmed) */}
            {confirmedMappings && parsedListings.length > 0 && !localizeResults.length && (
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

                {/* Batch limit warning */}
                {parsedListings.length > MAX_BATCH_SIZE && (
                  <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 mb-3">
                    <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p className="text-sm text-yellow-200 font-medium">
                        This file has {parsedListings.length} listings. Plus supports up to 200 per batch.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Split your file into smaller batches, or localize the first 200 and come back for the rest.
                      </p>
                      <button
                        onClick={trimToMaxBatch}
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

            {/* Export Panel (after localization complete) */}
            {localizeResults.length > 0 && selectedMarketplace && (
              <ExportPanel
                results={localizeResults}
                marketplace={selectedMarketplace}
                targetLanguage={selectedLocalizeLang}
                originalRows={parsedFile?.rows}
              />
            )}
          </div>

          {/* Right: Marketplace selector + localize button */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
              <MarketplaceSelector
                selectedMarketplace={selectedMarketplace}
                onSelect={setSelectedMarketplace}
                selectedLanguage={selectedLocalizeLang}
                onLanguageChange={setSelectedLocalizeLang}
                isPro={isPro}
              />

              <button
                onClick={handleLocalize}
                disabled={localizeLoading || parsedListings.length === 0 || !selectedMarketplace || !selectedLocalizeLang}
                className="w-full bg-yellow-400 text-black font-extrabold py-5 rounded-xl hover:bg-yellow-300 disabled:bg-gray-800 disabled:text-gray-500 transition-all text-lg flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
              >
                {localizeLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Localizing... {localizeProgress.done}/{localizeProgress.total}
                  </>
                ) : (
                  <>
                    <Zap size={18} fill="black" />
                    Localize {parsedListings.length > 0 ? `${parsedListings.length} Listing${parsedListings.length !== 1 ? "s" : ""}` : "Listings"}
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
