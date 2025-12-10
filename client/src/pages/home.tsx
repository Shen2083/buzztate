import { useState } from "react";
import { Search } from "lucide-react"; 

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
      <div className="max-w-5xl w-full flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-400 flex items-center gap-2">
            <span>⚡</span> Buzztate
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Pro Translation Suite</p>
        </div>
        {results.length > 0 && (
          <button onClick={downloadCSV} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm">
            <span>📥</span> Download CSV
          </button>
        )}
      </div>

      {/* 🎛️ Main Control Panel */}
      <div className="max-w-5xl w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-10">
        
        {/* Top Section: Text Input */}
        <div className="p-6 border-b border-gray-800">
          <textarea
            className="w-full bg-transparent text-xl text-gray-200 placeholder-gray-600 outline-none resize-none h-32"
            placeholder="What do you want to translate today?"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* Middle Section: Settings Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-900/50">
          
          {/* Vibe Selector */}
          <div className="col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Vibe</label>
            <div className="relative">
              <select 
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-yellow-400 outline-none appearance-none font-medium"
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
              <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">▼</div>
            </div>
          </div>

          {/* Language Search & Tools */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Target Markets <span className="text-yellow-400">({selectedLanguages.length})</span>
              </label>
              <div className="flex gap-2">
                 <button onClick={selectAllFiltered} className="text-[10px] text-gray-400 hover:text-white underline">Select All</button>
                 <button onClick={clearSelection} className="text-[10px] text-gray-400 hover:text-red-400 underline">Clear</button>
              </div>
            </div>
            <div className="relative">
               <input 
                type="text" 
                placeholder="Search languages..." 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 pl-10 text-sm focus:border-yellow-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-3 text-gray-500">🔍</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Language Chips */}
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
            {filteredLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`text-xs py-2 px-3 rounded-full border transition-all ${
                  selectedLanguages.includes(lang)
                    ? "bg-yellow-400 text-black border-yellow-400 font-bold shadow-lg shadow-yellow-400/20"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button (Full Width Footer) */}
        <button
          onClick={handleBuzztate}
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-extrabold py-5 hover:bg-yellow-300 transition-all text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "BUZZING..." : "⚡ TRANSLATE NOW"}
        </button>
      </div>

      {/* 📊 Results Grid */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {results.map((item, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-yellow-400/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                 <span className="text-sm font-bold text-gray-300 uppercase">{item.language}</span>
               </div>
               <button 
                 onClick={() => {navigator.clipboard.writeText(item.translation); alert("Copied!");}}
                 className="text-xs text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
               >
                 Copy
               </button>
            </div>
            
            <p className="text-lg text-white mb-4 font-medium leading-relaxed">{item.translation}</p>
            
            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Reality Check</p>
              <p className="text-sm text-gray-400 italic">"{item.reality_check}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
