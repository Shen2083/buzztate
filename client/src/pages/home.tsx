import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, ChevronDown, Check, Download, Info, Globe, Zap, Lock } from "lucide-react"; 

const ALL_LANGUAGES = [
  "Spanish", "French", "German", "Japanese", "Italian", "Portuguese", 
  "Chinese (Simplified)", "Chinese (Traditional)", "Korean", "Russian",
  "Arabic", "Hindi", "Dutch", "Turkish", "Polish", "Swedish", "Danish",
  "Norwegian", "Finnish", "Greek", "Hebrew", "Thai", "Vietnamese",
  "Indonesian", "Malay", "Czech", "Hungarian", "Romanian", "Ukrainian"
];

const PRO_STYLES = [
  "Professional / Corporate", "Gen Z Influencer", "App Store Description", 
  "Marketing Copy", "Romantic Poet", "Angry New Yorker"
];
// ... keep imports ...
import { supabase } from "@/lib/supabase"; // Make sure this is imported!

export default function Home({ session }: { session: any }) { // Receive session prop
    const [isPro, setIsPro] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // 1. Fetch the User's "Pro Status" from Supabase
    useEffect(() => {
      async function checkProStatus() {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', session.user.id)
            .single();

          if (data && data.is_pro) {
            setIsPro(true);
          }
        } catch (error) {
          console.error("Error checking pro status:", error);
        } finally {
          setLoadingProfile(false);
        }
      }

      checkProStatus();
    }, [session]);

  const [inputText, setInputText] = useState("");
  const [style, setStyle] = useState("Modern Slang");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Spanish"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const filteredLanguages = ALL_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLanguage = (lang: string) => {
    // FREE PLAN LIMIT: Only 1 Language
    if (!isPro) {
      if (selectedLanguages.includes(lang)) {
        setSelectedLanguages([]); // Deselect
      } else {
        setSelectedLanguages([lang]); // Replace with new one (max 1)
      }
      return;
    }

    // PRO PLAN: Unlimited (Safety cap at 15)
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      if (selectedLanguages.length < 15) {
        setSelectedLanguages([...selectedLanguages, lang]);
      } else {
        alert("Even Pros have limits! Select max 15 to prevent timeout.");
      }
    }
  };

  const selectAllFiltered = () => {
    if (!isPro) {
      alert("Upgrade to Pro to select multiple languages at once! ⚡");
      return;
    }
    const newSelection = Array.from(new Set([...selectedLanguages, ...filteredLanguages]));
    if (newSelection.length > 15) {
       setSelectedLanguages(newSelection.slice(0, 15));
    } else {
       setSelectedLanguages(newSelection);
    }
  };

  const clearSelection = () => setSelectedLanguages([]);
  
  const handleStyleChange = (e: any) => {
    const newStyle = e.target.value;
    if (!isPro && PRO_STYLES.includes(newStyle)) {
      alert(`The "${newStyle}" vibe is for Pro users only! Upgrade to unlock.`);
      return;
    }
    setStyle(newStyle);
  };

  const handleBuzztate = async () => {
    if (!inputText) return;
    if (selectedLanguages.length === 0) {
      alert("Please select a language!");
      return;
    }
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
        }),
      });
      const data = await response.json();
      if (data.results) setResults(data.results);
    } catch (error) {
      console.error(error);
      alert("Error translating.");
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!isPro) {
      alert("CSV Export is a Pro feature! ⚡ Upgrade to download.");
      return;
    }
    // ... (Existing CSV Logic)
    if (results.length === 0) return;
    const headers = ["Language", "Style", "Original Text", "Translation", "Reality Check"];
    const rows = results.map(item => [
      item.language,
      style,
      `"${inputText.replace(/"/g, '""')}"`,
      `"${item.translation.replace(/"/g, '""')}"`,
      `"${item.reality_check.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `buzztate_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
      
      {/* ⚡ App Header */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Buzztate</span>
            {isPro ? (
              <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded ml-2 font-bold uppercase">PRO SUITE</span>
            ) : (
              <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded ml-2 font-bold uppercase">FREE STARTER</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {!isPro && (
              <a href="/app?plan=pro" className="text-xs bg-gray-800 hover:bg-yellow-400 hover:text-black border border-gray-600 px-3 py-1.5 rounded-full transition-all">
                Upgrade to Pro ($10)
              </a>
            )}
            <a href="/" className="text-sm text-gray-400 hover:text-white">Exit</a>
          </div>
        </div>
      </nav>

      {/* 🎛️ Main Workspace */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 mt-6">
        
        {/* Left: Input */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-1 flex-grow min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
               <div className="flex items-center gap-2">
                 <Globe size={14} className="text-gray-500" />
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source Content</span>
               </div>
            </div>
            <textarea
              className="w-full h-full bg-transparent p-6 text-xl text-gray-200 placeholder-gray-600 outline-none resize-none flex-grow leading-relaxed font-light"
              placeholder={isPro ? "Paste your text here..." : "Paste your text here (Free Plan: 1 language at a time)..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Tools Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl">
            
            {/* Style Selector */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex justify-between">
                <span>Vibe Setting</span>
                {!isPro && <span className="text-yellow-400 text-[10px] flex items-center gap-1"><Lock size={10}/> Pro Locked</span>}
              </label>
              <div className="relative">
                <select 
                  className={`w-full p-4 rounded-xl bg-black border border-gray-700 text-white focus:border-yellow-400 outline-none appearance-none font-medium transition-colors cursor-pointer ${!isPro && "text-gray-400"}`}
                  value={style}
                  onChange={handleStyleChange}
                >
                  <option>Modern Slang</option>
                  <option disabled={!isPro}>Professional / Corporate {isPro ? "" : "(Pro)"}</option>
                  <option disabled={!isPro}>Gen Z Influencer {isPro ? "" : "(Pro)"}</option>
                  <option disabled={!isPro}>App Store Description {isPro ? "" : "(Pro)"}</option>
                  <option disabled={!isPro}>Marketing Copy {isPro ? "" : "(Pro)"}</option>
                  <option disabled={!isPro}>Romantic Poet {isPro ? "" : "(Pro)"}</option>
                </select>
                <ChevronDown className="absolute right-4 top-4 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Markets</label>
                {!isPro && <span className="text-[10px] text-gray-500">Free: 1 Max</span>}
              </div>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Search languages..." 
                  className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 pl-9 text-sm focus:border-yellow-400 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="h-[250px] overflow-y-auto custom-scrollbar border border-gray-800 rounded-lg bg-black/30 p-1 space-y-0.5">
                 <div className="sticky top-0 bg-black/90 backdrop-blur z-10 p-2 border-b border-gray-800 flex justify-between">
                   <button onClick={selectAllFiltered} className={`text-[10px] uppercase font-bold tracking-wide ${isPro ? "text-gray-400 hover:text-white" : "text-gray-700 cursor-not-allowed"}`}>
                     {isPro ? "Select All" : "Select All (Pro)"}
                   </button>
                   <button onClick={clearSelection} className="text-[10px] text-gray-500 hover:text-red-400 uppercase font-bold tracking-wide">Clear</button>
                </div>
                
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`w-full text-left text-sm py-2 px-3 rounded-md transition-all flex items-center justify-between group ${
                      selectedLanguages.includes(lang)
                        ? "bg-yellow-400 text-black font-bold"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {lang}
                    {selectedLanguages.includes(lang) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBuzztate}
              disabled={loading}
              className="w-full bg-yellow-400 text-black font-extrabold py-5 rounded-xl hover:bg-yellow-300 transition-all text-lg mt-6 flex justify-center items-center gap-2"
            >
              {loading ? "Adapting..." : isPro ? "ADAPT ALL MARKETS" : "TRANSLATE (FREE)"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="max-w-7xl w-full p-6">
          <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-white">Results</h2>
            <button 
              onClick={downloadCSV} 
              className={`font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm ${isPro ? "bg-green-600 hover:bg-green-500 text-white" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
            >
              {!isPro && <Lock size={14} />}
              <span>{isPro ? "Download CSV" : "CSV (Pro Only)"}</span>
            </button>
          </div>
          {/* ... (Existing Results Grid - Same as before) ... */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {results.map((item, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-yellow-400/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                
                <div className="flex justify-between items-start mb-4">
                   <span className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Globe size={12} /> {item.language}
                   </span>
                   <button 
                     onClick={() => {navigator.clipboard.writeText(item.translation); alert("Copied!");}}
                     className="text-[10px] text-gray-500 hover:text-white bg-black hover:bg-gray-700 px-2 py-1 rounded transition-colors border border-gray-800"
                   >
                     COPY
                   </button>
                </div>
                
                <p className="text-lg text-white mb-6 font-medium leading-relaxed">{item.translation}</p>
                
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Literal Meaning</p>
                  <p className="text-sm text-gray-400 italic">"{item.reality_check}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
