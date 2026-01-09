import { useState, useEffect } from "react";
import { Search, ChevronDown, Check, Zap, Lock, Globe, History, Layout, Clock, Copy, LogOut } from "lucide-react"; 
import { supabase } from "@/lib/supabase";

// ✅ UPDATED: Added "English" to the top of the list
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

export default function Home({ session }: { session: any }) {
  // User State
  const [isPro, setIsPro] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // App State
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'history'
  const [inputText, setInputText] = useState("");
  const [style, setStyle] = useState("Modern Slang");
  // Defaulting to Spanish, but user can now uncheck it and pick English
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Spanish"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 1. CHECK PRO STATUS
  useEffect(() => {
    async function checkProStatus() {
      const { data } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', session.user.id)
        .single();

      if (data && data.is_pro) setIsPro(true);
    }
    checkProStatus();
  }, [session]);

  // 2. FETCH HISTORY (When tab changes)
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) setHistory(data);
    if (error) console.error("History fetch error:", error);
    setHistoryLoading(false);
  };

  // 3. HANDLE CHECKOUT
  const handleBilling = async () => {
    setCheckoutLoading(true);
    try {
      const endpoint = isPro ? "/api/portal" : "/api/checkout";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
           "Content-Type": "application/json",
           "X-User-ID": session.user.id 
        },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Could not connect to billing server.");
      }
    } catch (error) {
      alert("Something went wrong.");
    }
    setCheckoutLoading(false);
  };

  // 4. HANDLE LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // Redirect to landing page
  };

  // 5. AUTO-TRIGGER CHECKOUT
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "checkout") {
      if (!isPro && !checkoutLoading) {
        console.log("🚀 Auto-triggering checkout...");
        handleBilling();
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [session, isPro]);

  // 6. TRANSLATION LOGIC
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
    if (!isPro) return alert("Upgrade to Pro to select multiple languages!");
    const newSelection = Array.from(new Set([...selectedLanguages, ...filteredLanguages]));
    setSelectedLanguages(newSelection.slice(0, 15));
  };

  const handleBuzztate = async () => {
    if (!inputText) return;
    if (selectedLanguages.length === 0) return alert("Please select a language!");

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          target_languages: selectedLanguages,
          style: style,
          userId: session.user.id
        }),
      });
      const data = await response.json();
      if (data.results) setResults(data.results);
    } catch (error) {
      alert("Error translating.");
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!isPro) return alert("Upgrade to unlock CSV export!");
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
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">

      {/* ⚡ App Header */}
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
              <button 
                onClick={handleBilling} 
                disabled={checkoutLoading}
                className={`text-xs px-3 py-1.5 rounded-full transition-all disabled:opacity-50 border ${
                  isPro 
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600" 
                    : "bg-gray-800 hover:bg-yellow-400 hover:text-black border-gray-600"
                }`}
              >
                {checkoutLoading ? "..." : (isPro ? "Manage Subscription" : "Upgrade to Pro ($10)")}
              </button>

              {/* 🚪 LOGOUT BUTTON */}
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

      {/* 📂 Tab Navigation */}
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
                  // ✅ UPDATED PLACEHOLDER to reflect multilingual capability
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
                        if (!isPro && PRO_STYLES.includes(e.target.value)) return alert("Upgrade to unlock!");
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
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Markets</label>
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
                        <button onClick={() => navigator.clipboard.writeText(item.translation)} className="text-[10px] text-gray-500 bg-black px-2 py-1 rounded border border-gray-800 hover:text-white">COPY</button>
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
                      onClick={() => {navigator.clipboard.writeText(record.translated_text); alert("Copied!")}} 
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