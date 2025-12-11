import { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react"; 

const ALL_LANGUAGES = [
  "Spanish", "French", "German", "Japanese", "Italian", "Portuguese", 
  "Chinese (Simplified)", "Chinese (Traditional)", "Korean", "Russian",
  "Arabic", "Hindi", "Dutch", "Turkish", "Polish", "Swedish", "Danish",
  "Norwegian", "Finnish", "Greek", "Hebrew", "Thai", "Vietnamese",
  "Indonesian", "Malay", "Czech", "Hungarian", "Romanian", "Ukrainian"
];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [style, setStyle] = useState("Modern Slang");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Spanish", "French", "German"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredLanguages = ALL_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      if (selectedLanguages.length < 15) {
        setSelectedLanguages([...selectedLanguages, lang]);
      } else {
        alert("Select max 15 languages at once.");
      }
    }
  };

  const selectAllFiltered = () => {
    const newSelection = Array.from(new Set([...selectedLanguages, ...filteredLanguages]));
    if (newSelection.length > 15) {
       setSelectedLanguages(newSelection.slice(0, 15));
    } else {
       setSelectedLanguages(newSelection);
    }
  };

  const clearSelection = () => setSelectedLanguages([]);

  const handleBuzztate = async () => {
    if (!inputText) return;
    if (selectedLanguages.length === 0) {
      alert("Please select at least one language!");
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
    <div className="min-h-screen bg-black text-white p-6 font-sans flex flex-col items-center">
      
      {/* ⚡ Header */}
      <div className="max-w-7xl w-full flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Buzztate</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Pro Suite</p>
          </div>
        </div>
        {results.length > 0 && (
          <button onClick={downloadCSV} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm">
            <span>📥</span> Export Report
          </button>
        )}
      </div>

      {/* 🎛️ Split Dashboard Layout */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Left Column: The Editor (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-1 flex-grow h-full min-h-[400px] flex flex-col">
            <div className="p-4 border-b border-gray-800">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source Text</span>
            </div>
            <textarea
              className="w-full h-full bg-transparent p-6 text-xl text-gray-200 placeholder-gray-600 outline-none resize-none flex-grow leading-relaxed"
              placeholder="Type or paste your content here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: The Command Center (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Vibe Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Translation Vibe</label>
            <div className="relative">
              <select 
                className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white focus:border-yellow-400 outline-none appearance-none font-medium transition-colors"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option>Modern Slang</option>
                <option>Professional / Corporate</option>
                <option>Gen Z Influencer</option>
                <option>App Store Description</option>
                <option>Marketing Copy</option>
                <option>Romantic Poet</option>
                <option>Angry New Yorker</option>
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-gray-500">▼</div>
            </div>
          </div>

          {/* Language Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Markets</label>
              <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">{selectedLanguages.length} Selected</span>
            </div>
            
            {/* Search */}
            <div className="relative mb-3">
               <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 pl-9 text-sm focus:border-yellow-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-2 text-gray-500 text-xs">🔍</span>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar max-h-[300px] border border-gray-800 rounded-lg bg-black/50 p-2 space-y-1">
              <div className="flex justify-between px-2 py-1 mb-1 border-b border-gray-800">
                 <button onClick={selectAllFiltered} className="text-[10px] text-gray-400 hover:text-white">Select All</button>
                 <button onClick={clearSelection} className="text-[10px] text-gray-400 hover:text-red-400">Clear</button>
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
                  {selectedLanguages.includes(lang) && <span className="text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Big Action Button */}
          <button
            onClick={handleBuzztate}
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-extrabold py-5 rounded-xl hover:bg-yellow-300 transition-all text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "BUZZING..." : "⚡ TRANSLATE NOW"}
          </button>
        </div>
      </div>

      {/* 📊 Results Grid */}
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {results.map((item, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-yellow-400/30 transition-all group">
            <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-3">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                 <span className="text-sm font-bold text-gray-200 uppercase tracking-wide">{item.language}</span>
               </div>
               <button 
                 onClick={() => {navigator.clipboard.writeText(item.translation); alert("Copied!");}}
                 className="text-xs text-gray-500 hover:text-white bg-black hover:bg-gray-700 px-3 py-1.5 rounded transition-colors font-medium border border-gray-800"
               >
                 Copy Text
               </button>
            </div>
            
            <p className="text-lg text-white mb-5 font-medium leading-relaxed">{item.translation}</p>
            
            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Meaning</span>
                <div className="h-[1px] bg-gray-800 flex-grow"></div>
              </div>
              <p className="text-sm text-gray-400 italic">"{item.reality_check}"</p>
            </div>
          </div>
        ))}
      </div>
      {/* ... (Your existing Results Grid is above this) ... */}

      {/* SEO Content Section: Visible to users and Google */}
      <div className="max-w-7xl w-full mt-24 mb-12 pt-12 border-t border-gray-800 text-gray-400">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Why use Buzztate?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h3 className="text-yellow-400 font-bold mb-3 text-lg">For Content Creators</h3>
            <p className="text-sm leading-relaxed">
              Globalize your content without losing your voice. Translate your captions into 
              <strong className="text-gray-300"> Gen Z Slang</strong>, internet subculture tones, or specific regional dialects to connect authentically on TikTok and Instagram.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h3 className="text-yellow-400 font-bold mb-3 text-lg">For Professionals</h3>
            <p className="text-sm leading-relaxed">
              Draft an email in rough English and let our <strong className="text-gray-300">Corporate Style</strong> engine 
              polish it into executive-level German, Japanese, or French. Perfect for cross-border business communication.
            </p>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <h3 className="text-yellow-400 font-bold mb-3 text-lg">For App Developers</h3>
            <p className="text-sm leading-relaxed">
              Stop using robotic auto-translations for your App Store descriptions. Use Buzztate to generate 
              <strong className="text-gray-300"> ASO-optimized marketing copy</strong> that actually converts users in 30+ local markets.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest">© 2025 Buzztate Inc. The AI Translation Suite.</p>
        </div>
      </div>
    </div>
  );
}
