import { useState } from "react";

// ⚡ The Pro Language List: 30+ Options
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
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Toggle Language Logic
  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      if (selectedLanguages.length < 10) {
        setSelectedLanguages([...selectedLanguages, lang]);
      } else {
        alert("Please select max 10 languages at a time for speed.");
      }
    }
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
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Translation failed. Please try again.");
    }
    setLoading(false);
  };

  // 📥 CSV Export Function
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
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans flex flex-col items-center">
      
      {/* ⚡ Header */}
      <div className="max-w-4xl w-full text-center mb-8">
        <h1 className="text-5xl font-extrabold text-yellow-400 mb-2 flex justify-center items-center gap-3">
          <span>⚡</span> Buzztate
        </h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase">The Pro Translation Suite</p>
      </div>

      {/* 🎛️ Main Interface */}
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          <textarea
            className="w-full p-5 rounded-xl bg-gray-800 border border-gray-700 focus:border-yellow-400 outline-none h-48 text-lg transition-all shadow-inner resize-none"
            placeholder="Paste your caption, app description, or marketing copy..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Vibe Check</label>
            <select 
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-yellow-400 outline-none"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option>Modern Slang</option>
              <option>Professional / Corporate</option>
              <option>Gen Z Influencer</option>
              <option>App Store Description (ASO)</option>
              <option>Persuasive Marketing Copy</option>
              <option>Romantic Poet</option>
              <option>Angry New Yorker</option>
            </select>
          </div>
        </div>

        {/* Right Column: Languages & Actions */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Target Markets ({selectedLanguages.length})
              </label>
              <button onClick={() => setSelectedLanguages([])} className="text-xs text-yellow-400 hover:text-white underline">Clear</button>
            </div>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto custom-scrollbar pr-2 flex-grow max-h-[300px]">
              {ALL_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`text-xs py-2 px-1 rounded-md border transition-all truncate ${
                    selectedLanguages.includes(lang)
                      ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                      : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button
              onClick={handleBuzztate}
              disabled={loading}
              className="bg-yellow-400 text-black font-extrabold py-4 rounded-xl hover:bg-yellow-300 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? "Buzzing..." : "⚡ TRANSLATE"}
            </button>
            {results.length > 0 && (
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-500 transition-all shadow-lg flex justify-center items-center gap-2"
              >
                <span>📥</span> Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📊 Results Feed */}
      <div className="max-w-4xl w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {results.map((item, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative group hover:border-yellow-400/50 transition-all">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
               <span className="text-xs text-yellow-400 uppercase font-bold tracking-widest flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                 {item.language}
               </span>
               <button 
                 onClick={() => {navigator.clipboard.writeText(item.translation); alert("Copied!");}}
                 className="text-xs bg-gray-700 hover:bg-white hover:text-black px-3 py-1 rounded-full text-white transition-all"
               >
                 Copy
               </button>
            </div>
            <div className="text-lg font-medium mb-4 leading-relaxed text-gray-100">{item.translation}</div>
            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Reality Check:</span>
              <p className="text-sm text-gray-400 italic">"{item.reality_check}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
