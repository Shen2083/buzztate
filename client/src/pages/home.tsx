import { useState, useRef } from "react";
import { Search, ChevronDown, Check, Download, Info } from "lucide-react"; 

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
  
  const aboutSectionRef = useRef<HTMLDivElement>(null);

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
  
  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
      
      {/* ⚡ Header */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-xl tracking-tight">Buzztate</span>
          </div>
          <div>
            <button 
              onClick={scrollToAbout}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Info size={16} />
              <span>About</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 🎛️ Main Workspace */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 mt-6">
        
        {/* Left: Input Editor */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-1 flex-grow min-h-[500px] flex flex-col relative group focus-within:border-gray-700 transition-colors">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source Content</span>
               {inputText.length > 0 && (
                 <span className="text-xs text-gray-600">{inputText.length} chars</span>
               )}
            </div>
            <textarea
              className="w-full h-full bg-transparent p-6 text-xl text-gray-200 placeholder-gray-600 outline-none resize-none flex-grow leading-relaxed font-light"
              placeholder="Paste your app description, email draft, or caption here..."
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Target Vibe</label>
              <div className="relative">
                <select 
                  className="w-full p-4 rounded-xl bg-black border border-gray-700 text-white focus:border-yellow-400 outline-none appearance-none font-medium transition-colors cursor-pointer"
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
                <ChevronDown className="absolute right-4 top-4 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Languages</label>
                {selectedLanguages.length > 0 && (
                  <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                    {selectedLanguages.length}
                  </span>
                )}
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

              <div className="h-[250px] overflow-y-auto custom-scrollbar border border-gray-800 rounded-lg bg-black/30 p-1 space-y-0.5">
                <div className="sticky top-0 bg-black/90 backdrop-blur z-10 p-2 border-b border-gray-800 flex justify-between">
                   <button onClick={selectAllFiltered} className="text-[10px] text-gray-400 hover:text-white uppercase font-bold tracking-wide">Select All</button>
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

            {/* Action Button */}
            <button
              onClick={handleBuzztate}
              disabled={loading}
              className="w-full bg-yellow-400 text-black font-extrabold py-5 rounded-xl hover:bg-yellow-300 transition-all text-lg shadow-[0_0_20px_rgba(250,204,21,0.2)] disabled:opacity-50 disabled:shadow-none mt-6 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚡</span> Generating...
                </>
              ) : (
                "TRANSLATE NOW"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Results Section */}
      {results.length > 0 && (
        <div className="max-w-7xl w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-white">Results</h2>
            
            <button 
              onClick={downloadCSV} 
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-green-500/20"
            >
              <Download size={16} />
              <span>Download CSV Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-yellow-400/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                
                <div className="flex justify-between items-start mb-4">
                   <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{item.language}</span>
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

      {/* ℹ️ About / SEO Footer (With Credit) */}
      <div ref={aboutSectionRef} className="w-full bg-gray-900 border-t border-gray-800 mt-auto py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="col-span-1">
             <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <span className="font-bold text-lg text-white">Buzztate</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              The AI-powered translation suite designed for nuance, slang, and professional context.
            </p>
            <div className="mt-8 flex flex-col gap-1">
               <p className="text-gray-600 text-xs">© 2025 Buzztate Inc.</p>
               <p className="text-gray-700 text-xs flex items-center gap-1">
                 Made with <span className="text-red-900">♥</span> by Shen
               </p>
            </div>
          </div>

          <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">For Creators</h4>
              <p className="text-gray-500 text-sm">Translate captions into <strong>Gen Z Slang</strong> and internet subculture tones to connect with global audiences on TikTok & Instagram.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Business</h4>
              <p className="text-gray-500 text-sm">Draft emails in rough English and convert them to <strong>Corporate Style</strong> German, Japanese, or French instantly.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Developers</h4>
              <p className="text-gray-500 text-sm">Generate <strong>ASO-optimized</strong> app store descriptions in 30+ languages without sounding like a robot.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
