import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronDown, Check, Zap, Lock, Globe, History, Layout, Clock, Copy, LogOut, Loader2, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { ColumnMapping, ParsedListing, LocalizationResultItem } from "@shared/schema";
import type { MarketplaceId } from "../../../lib/marketplace-profiles";
import { parseUploadedFile, applyColumnMappings, type ParsedFileResult } from "@/lib/file-parser-client";
import FileUpload from "@/components/FileUpload";
import ColumnMapper from "@/components/ColumnMapper";
import MarketplaceSelector from "@/components/MarketplaceSelector";
import ExportPanel from "@/components/ExportPanel";

// ALL LANGUAGES (English First)
const ALL_LANGUAGES = [
  "English", "Spanish", "French", "German", "Japanese", "Italian", "Portuguese",
  "Chinese (Simplified)", "Chinese (Traditional)", "Korean", "Russian",
  "Arabic", "Hindi", "Dutch", "Turkish", "Polish", "Swedish", "Danish",
  "Norwegian", "Finnish", "Greek", "Hebrew", "Thai", "Vietnamese",
  "Indonesian", "Malay", "Czech", "Hungarian", "Romanian", "Ukrainian"
];

const PRO_STYLES = [
  "Professional / Corporate", "Gen Z Influencer", "App Store Description",
  "Marketing Copy", "Romantic Poet", "Angry New Yorker"
];

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
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const planPickerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("create");
  const [inputText, setInputText] = useState("");
  const [style, setStyle] = useState("Modern Slang");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Spanish"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
  const [fileParseLoading, setFileParseLoading] = useState(false);

  // 1. CHECK PRO STATUS & VERIFY PAYMENT
  useEffect(() => {
    const checkStatus = async () => {
      // Force refresh data from DB to ensure we aren't reading stale cache
      const { data } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', session.user.id)
        .single();

      if (data?.is_pro) {
        setIsPro(true);
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
              description: "You are now a Pro user. Enjoy unlimited features!",
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

  // Close plan picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (planPickerRef.current && !planPickerRef.current.contains(e.target as Node)) {
        setShowPlanPicker(false);
      }
    };
    if (showPlanPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPlanPicker]);

  // 2. FETCH HISTORY
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

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

  // 3. HANDLE CHECKOUT - Now uses JWT auth
  const handleBilling = async (plan?: string) => {
    setCheckoutLoading(true);
    setShowPlanPicker(false);
    try {
      // Refresh session before billing to ensure valid token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        // Try refreshing the session
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
        body: JSON.stringify(isPro ? {} : { plan: plan || "starter" }),
      });

      // Handle non-JSON responses (e.g. proxy error pages)
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

  const getMockEnglishResult = (text: string, vibe: string) => {
    let translation = text;
    let meaning = "Rewritten for tone";

    if (vibe.includes("Slang")) {
      translation = "Yo, " + text.toLowerCase() + " no cap.";
      meaning = "Casual/Gen Z Interpretation";
    } else if (vibe.includes("Corporate")) {
      translation = "Please be advised that " + text.toLowerCase() + ".";
      meaning = "Formal Business Context";
    } else if (vibe.includes("New Yorker")) {
      translation = "Yo, listen here: " + text.toLowerCase() + ", alright?";
      meaning = "Direct/Aggressive Tone";
    } else if (vibe.includes("Marketing")) {
      translation = "Discover: " + text;
      meaning = "Engaging Copy";
    }

    return {
      language: "English",
      translation: translation,
      reality_check: meaning
    };
  };

  // 5. TRANSLATION LOGIC
  const filteredLanguages = ALL_LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLanguage = (lang: string) => {
    if (!isPro) {
      if (selectedLanguages.includes(lang)) setSelectedLanguages([]);
      else setSelectedLanguages([lang]);
      return;
    }
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      if (selectedLanguages.length < 15) setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const selectAllFiltered = () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to select multiple languages!",
      });
      return;
    }
    const newSelection = Array.from(new Set([...selectedLanguages, ...filteredLanguages]));
    setSelectedLanguages(newSelection.slice(0, 15));
  };

  // UPDATED: Robust English Injection Logic with JWT auth
  const handleBuzztate = async () => {
    if (!inputText) return;
    if (selectedLanguages.length === 0) {
      toast({
        title: "Select a Language",
        description: "Please select at least one language to translate to.",
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const needsEnglish = selectedLanguages.includes("English");
      const apiLangs = selectedLanguages.filter(l => l !== "English");

      console.log("Translation Request:", { needsEnglish, apiLangs });

      let apiResults: any[] = [];

      // 1. Call API for foreign languages - Now uses JWT auth
      if (apiLangs.length > 0) {
        const headers = await getAuthHeaders();

        const response = await fetch("/api/translate", {
          method: "POST",
          headers,
          body: JSON.stringify({
            text: inputText,
            target_languages: apiLangs,
            style: style,
            userId: session.user.id
          }),
        });

        const data = await response.json();

        if (response.ok && data.results) {
          apiResults = data.results;
        } else if (data.error) {
          toast({
            title: "Translation Error",
            description: data.error,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      // 2. Inject English Result if needed
      let finalResults = [...apiResults];

      if (needsEnglish) {
        console.log("Injecting English Result...");
        const englishResult = getMockEnglishResult(inputText, style);
        // Prepend English to the start of the list
        finalResults.unshift(englishResult);
      }

      setResults(finalResults);

      if (finalResults.length > 0) {
        toast({
          title: "Translation Complete",
          description: `Successfully translated to ${finalResults.length} language(s).`,
        });
      }

    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "An error occurred while translating. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to unlock CSV export!",
      });
      return;
    }
    if (results.length === 0) return;

    const headers = ["Language", "Style", "Original", "Translation", "Meaning"];
    const rows = results.map(item => [
      item.language, style, `"${inputText.replace(/"/g, '""')}"`,
      `"${item.translation.replace(/"/g, '""')}"`, `"${item.reality_check.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }));
    link.download = `buzztate_export.csv`;
    link.click();

    toast({
      title: "Download Started",
      description: "Your CSV file is being downloaded.",
    });
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

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/localize", {
        method: "POST",
        headers,
        body: JSON.stringify({
          listings: parsedListings,
          marketplace: selectedMarketplace,
          targetLanguage: selectedLocalizeLang,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.results) {
        setLocalizeResults(data.results);
        const flagCount = data.results.reduce((s: number, r: any) => s + r.qualityFlags.length, 0);
        toast({
          title: "Localization Complete",
          description: `${data.results.length} listings localized.${flagCount > 0 ? ` ${flagCount} quality flag(s).` : ""}`,
        });
      } else {
        toast({
          title: "Localization Error",
          description: data.error || "Something went wrong.",
          variant: "destructive",
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

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">

      {/* App Header */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl hidden sm:block">Buzztate</span>
            {isPro ? (
              <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded ml-2 font-bold uppercase">PRO SUITE</span>
            ) : (
              <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded ml-2 font-bold uppercase">FREE STARTER</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={planPickerRef}>
              <button
                onClick={() => isPro ? handleBilling() : setShowPlanPicker(!showPlanPicker)}
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
                    Upgrade
                  </>
                )}
              </button>

              {/* Plan picker dropdown */}
              {showPlanPicker && !isPro && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-800">
                    <p className="text-xs text-gray-400 font-medium">Choose a plan</p>
                  </div>
                  <button
                    onClick={() => handleBilling("starter")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Starter</span>
                      <span className="text-sm font-bold text-white">£29<span className="text-xs text-gray-500 font-normal">/mo</span></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">100 listings/month, 5 languages</p>
                  </button>
                  <button
                    onClick={() => handleBilling("growth")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 bg-yellow-400/5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-yellow-400">Growth</span>
                      <span className="text-sm font-bold text-yellow-400">£59<span className="text-xs text-gray-400 font-normal">/mo</span></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">500 listings/month, all languages</p>
                    <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold mt-1 inline-block">POPULAR</span>
                  </button>
                  <button
                    onClick={() => handleBilling("scale")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Scale</span>
                      <span className="text-sm font-bold text-white">£99<span className="text-xs text-gray-500 font-normal">/mo</span></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Unlimited listings, API access</p>
                  </button>
                </div>
              )}
            </div>

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

      {/* Tab Navigation */}
      <div className="w-full max-w-7xl px-6 mt-8">
        <div className="flex gap-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all ${
              activeTab === "create" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-500 hover:text-white"
            }`}
          >
            <Layout size={16} /> Create
          </button>
          <button
            onClick={() => setActiveTab("localize")}
            className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all ${
              activeTab === "localize" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-500 hover:text-white"
            }`}
          >
            <FileSpreadsheet size={16} /> Localize Listings
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all ${
              activeTab === "history" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-500 hover:text-white"
            }`}
          >
            <History size={16} /> History
          </button>
        </div>
      </div>

      {/* ---------------- CREATE MODE ---------------- */}
      {activeTab === "create" && (
        <>
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 mt-2">
            {/* Input */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-1 flex-grow min-h-[500px] flex flex-col relative group focus-within:border-gray-700 transition-colors">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source Content</span>
                  </div>
                  {inputText.length > 0 && <span className="text-xs text-gray-600">{inputText.length} chars</span>}
                </div>
                <textarea
                  className="w-full h-full bg-transparent p-6 text-xl text-gray-200 placeholder-gray-600 outline-none resize-none flex-grow leading-relaxed font-light"
                  placeholder={isPro ? "Paste text in any language here..." : "Paste text in any language here (Free Plan: 1 language at a time)..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            </div>

            {/* Tools */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="mb-6">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex justify-between">
                    <span>Vibe Setting</span>
                    {!isPro && <span className="text-yellow-400 text-[10px] flex items-center gap-1"><Lock size={10}/> Locked</span>}
                  </label>
                  <div className="relative">
                    <select
                      className={`w-full p-4 rounded-xl bg-black border border-gray-700 text-white focus:border-yellow-400 outline-none appearance-none font-medium transition-colors cursor-pointer ${!isPro && "text-gray-400"}`}
                      value={style}
                      onChange={(e) => {
                        if (!isPro && PRO_STYLES.includes(e.target.value)) {
                          toast({
                            title: "Pro Feature",
                            description: "Upgrade to unlock this vibe!",
                          });
                          return;
                        }
                        setStyle(e.target.value);
                      }}
                    >
                      <option>Modern Slang</option>
                      {PRO_STYLES.map(s => <option key={s} disabled={!isPro}>{s} {isPro ? "" : "(Pro)"}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-4 text-gray-500 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Output Language</label>
                  </div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 pl-9 text-sm focus:border-yellow-400 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="h-[250px] overflow-y-auto border border-gray-800 rounded-lg bg-black/30 p-1 space-y-0.5">
                    <div className="sticky top-0 bg-black/90 backdrop-blur z-10 p-2 border-b border-gray-800 flex justify-between">
                      <button onClick={selectAllFiltered} className="text-[10px] uppercase font-bold tracking-wide text-gray-400 hover:text-white">Select All</button>
                      <button onClick={() => setSelectedLanguages([])} className="text-[10px] text-gray-500 hover:text-red-400 uppercase font-bold tracking-wide">Clear</button>
                    </div>
                    {filteredLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={`w-full text-left text-sm py-2 px-3 rounded-md transition-all flex items-center justify-between ${
                          selectedLanguages.includes(lang) ? "bg-yellow-400 text-black font-bold" : "text-gray-400 hover:bg-gray-800"
                        }`}
                      >
                        {lang} {selectedLanguages.includes(lang) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleBuzztate}
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black font-extrabold py-5 rounded-xl hover:bg-yellow-300 transition-all text-lg mt-6 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  {loading ? <><span className="animate-spin"><Zap size={18} fill="black" /></span> Adapting...</> : <><Zap size={18} fill="black" /><span>TRANSLATE</span></>}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-w-7xl w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-4">
                <h2 className="text-2xl font-bold text-white">Results</h2>
                <button onClick={downloadCSV} className={`font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm ${isPro ? "bg-green-600 text-white" : "bg-gray-800 text-gray-500"}`}>
                  {!isPro && <Lock size={14} />} <span>{isPro ? "Download CSV" : "CSV (Pro Only)"}</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {results.map((item, index) => (
                  <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800 relative">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><Globe size={12} /> {item.language}</span>
                      <button onClick={() => handleCopy(item.translation)} className="text-[10px] text-gray-500 bg-black px-2 py-1 rounded border border-gray-800 hover:text-white">COPY</button>
                    </div>
                    <p className="text-lg text-white mb-6 font-medium">{item.translation}</p>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Literal Meaning</p>
                      <p className="text-sm text-gray-400 italic">"{item.reality_check}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------------- LOCALIZE LISTINGS MODE ---------------- */}
      {activeTab === "localize" && (
        <div className="max-w-7xl w-full p-6 mt-2 space-y-6 animate-in fade-in">
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
                />

                <button
                  onClick={handleLocalize}
                  disabled={localizeLoading || parsedListings.length === 0 || !selectedMarketplace || !selectedLocalizeLang}
                  className="w-full bg-yellow-400 text-black font-extrabold py-5 rounded-xl hover:bg-yellow-300 disabled:bg-gray-800 disabled:text-gray-500 transition-all text-lg flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  {localizeLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Localizing {parsedListings.length} listing{parsedListings.length !== 1 ? "s" : ""}...
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
      )}

      {/* ---------------- HISTORY MODE ---------------- */}
      {activeTab === "history" && (
        <div className="max-w-7xl w-full p-6 animate-in fade-in">
          {historyLoading ? (
            <div className="text-center text-gray-500 py-20">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center text-gray-500 py-20 border border-gray-800 rounded-2xl bg-gray-900/20">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No translations found yet.</p>
              <button onClick={() => setActiveTab("create")} className="text-yellow-400 hover:underline mt-2">Create your first one</button>
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
      )}

    </div>
  );
}
