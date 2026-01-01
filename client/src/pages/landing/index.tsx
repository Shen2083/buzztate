import { Link } from "wouter";
import { Check, X, Zap, Globe, Lock, ArrowRight, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

// Demo options
const DEMO_VIBES = ["Modern Slang", "Professional / Corporate", "Marketing Copy", "Angry New Yorker"];
const DEMO_LANGS = ["Spanish", "French", "German", "Japanese", "Italian", "Chinese"];

export default function Landing() {
  // --- ADVANCED DEMO STATE ---
  const [demoText, setDemoText] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResults, setDemoResults] = useState<any[]>([]); // Array for multiple results
  const [demoVibe, setDemoVibe] = useState("Modern Slang");
  const [demoSelectedLangs, setDemoSelectedLangs] = useState<string[]>(["Spanish", "French"]); // Default 2 langs

  const toggleDemoLang = (lang: string) => {
    if (demoSelectedLangs.includes(lang)) {
      setDemoSelectedLangs(demoSelectedLangs.filter(l => l !== lang));
    } else {
      if (demoSelectedLangs.length < 3) {
        setDemoSelectedLangs([...demoSelectedLangs, lang]);
      } else {
        alert("Demo is limited to 3 languages. Sign up for unlimited!");
      }
    }
  };

  const handleDemoTranslate = async () => {
    if (!demoText.trim()) return;
    if (demoSelectedLangs.length === 0) return alert("Select at least one language.");

    setDemoLoading(true);
    setDemoResults([]);

    try {
      // ⚡ TRICK: We send parallel requests to bypass the "1 language per request" Free limit
      // This makes the demo feel powerful without changing your backend logic.
      const requests = demoSelectedLangs.map(lang => 
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: demoText,
            target_languages: [lang], // Request 1 at a time
            style: demoVibe,
            // No userId = Anonymous/Free
          }),
        }).then(res => res.json())
      );

      const responses = await Promise.all(requests);

      // Combine all results
      const combinedResults = responses
        .flatMap(r => r.results || [])
        .filter(Boolean);

      setDemoResults(combinedResults);

    } catch (e) {
      console.error(e);
      alert("Demo limit reached. Please sign up!");
    }
    setDemoLoading(false);
  };
  // -------------------------

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black flex flex-col">

      {/* Navigation */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <span className="font-bold text-xl tracking-tight">Buzztate</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth?mode=login" className="text-sm font-bold text-gray-400 hover:text-white cursor-pointer transition-colors">
              Log In
            </Link>
            <Link 
              href="/auth?mode=signup" 
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full font-bold text-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section + Live Demo */}
      <div className="flex-grow flex flex-col items-center justify-start text-center px-6 pt-16 pb-12">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-5xl">
          Don't just translate. <br />
          <span className="text-yellow-400">Localize the Vibe.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The AI engine that adapts your content into Gen Z Slang, Corporate Speak, or Marketing Copy instantly.
        </p>

        {/* 🚀 LIVE DEMO WIDGET */}
        <div className="w-full max-w-4xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden mb-20 relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />

          {/* Widget Controls Header */}
          <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative">

             {/* Vibe Selector */}
             <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Wand2 size={12} className="text-yellow-400"/> Vibe:
                </span>
                <select 
                  value={demoVibe}
                  onChange={(e) => setDemoVibe(e.target.value)}
                  className="bg-black border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:border-yellow-400 outline-none cursor-pointer"
                >
                  {DEMO_VIBES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
             </div>

             {/* Language Pills */}
             <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Target:</span>
                {DEMO_LANGS.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleDemoLang(lang)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      demoSelectedLangs.includes(lang) 
                      ? "bg-yellow-400 text-black border-yellow-400 font-bold" 
                      : "bg-black/50 text-gray-400 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[350px]">
            {/* Input Area */}
            <div className="p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-800 bg-black/40 relative">
               <textarea 
                 className="w-full flex-grow bg-transparent outline-none text-lg resize-none placeholder-gray-600 font-light leading-relaxed"
                 placeholder="Paste your text here... (e.g. 'Hey team, just checking in on the status of the project.')"
                 value={demoText}
                 onChange={(e) => setDemoText(e.target.value)}
                 maxLength={280}
               />
               <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                 <span>{demoText.length}/280 chars</span>
                 <span className="text-yellow-400/50 uppercase font-bold tracking-widest">Input</span>
               </div>
            </div>

            {/* Output Area */}
            <div className="p-6 bg-gray-900/50 relative overflow-y-auto max-h-[400px]">
               {demoLoading ? (
                 <div className="h-full flex flex-col items-center justify-center text-yellow-400 gap-4 opacity-80">
                   <Loader2 className="animate-spin" size={32} /> 
                   <span className="animate-pulse text-sm font-bold uppercase tracking-widest">Applying "{demoVibe}"...</span>
                 </div>
               ) : demoResults.length > 0 ? (
                 <div className="space-y-4">
                   {demoResults.map((res, i) => (
                     <div key={i} className="bg-black/40 border border-white/10 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-500" style={{animationDelay: `${i * 100}ms`}}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-yellow-400 uppercase flex items-center gap-2">
                             <Globe size={10} /> {res.language}
                           </span>
                           <span className="text-[10px] text-gray-600 uppercase border border-gray-800 px-1.5 rounded">{demoVibe}</span>
                        </div>
                        <p className="text-white text-lg font-medium leading-relaxed mb-3">"{res.translation}"</p>
                        <p className="text-xs text-gray-500 italic border-t border-gray-800 pt-2">Meaning: "{res.reality_check}"</p>
                     </div>
                   ))}

                   <div className="pt-4 text-center">
                      <Link href="/auth?mode=signup" className="text-sm text-gray-400 hover:text-white underline decoration-yellow-400 underline-offset-4">
                        Unlock 30+ Languages & Export CSV →
                      </Link>
                   </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-40">
                   <Sparkles size={48} className="mb-4" />
                   <p className="text-sm font-medium">Select languages & click translate</p>
                 </div>
               )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
            <span className="text-xs text-gray-500 hidden sm:inline-block">Free demo mode (Limited to 280 chars)</span>
            <button 
              onClick={handleDemoTranslate}
              disabled={demoLoading || !demoText}
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3 rounded-xl font-extrabold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              {demoLoading ? "Processing..." : "TRANSLATE NOW"} <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* ✅ Features Grid (Restored Tiles View) */}
      <div className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-black border border-gray-800 hover:border-gray-700 transition-colors group">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Mass Localization</h3>
            <p className="text-gray-400 leading-relaxed">One input. 30+ global outputs. Scale your content instantly without copy-pasting 50 times.</p>
          </div>
          <div className="p-8 rounded-2xl bg-black border border-gray-800 hover:border-gray-700 transition-colors group">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Vibe Matching</h3>
            <p className="text-gray-400 leading-relaxed">Don't sound robotic. Sound like a local, an executive, or an influencer with our Vibe Engine.</p>
          </div>
          <div className="p-8 rounded-2xl bg-black border border-gray-800 hover:border-gray-700 transition-colors group">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
            <p className="text-gray-400 leading-relaxed">Your data is processed securely via HTTPS and never used for training without permission.</p>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center border-b border-gray-900">
        <h2 className="text-3xl font-bold mb-6">How to Translate into Multiple Languages at Once</h2>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          Most translators force you to copy-paste text one language at a time. 
          <strong>Buzztate</strong> is different. Our AI engine allows you to 
          <span className="text-white font-bold"> translate into multiple languages at once</span> 
          with a single click.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto mt-10">
          <Link 
            href="/auth?mode=signup" 
            className="flex-1 px-8 py-4 rounded-xl border border-gray-700 hover:bg-gray-900 text-white font-bold cursor-pointer transition-all text-center"
          >
            Try for Free
          </Link>
          <Link 
            href="/auth?mode=signup&intent=pro" 
            className="flex-1 px-8 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] text-center"
          >
            Get Pro - $10/mo
          </Link>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-5xl mx-auto px-6 py-32 w-full">
        <h2 className="text-4xl font-bold text-center mb-16">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="p-10 rounded-3xl border border-gray-800 bg-black flex flex-col hover:border-gray-600 transition-colors">
            <h3 className="text-2xl font-bold text-gray-400">Starter</h3>
            <div className="text-5xl font-bold mt-6 mb-4">$0 <span className="text-lg text-gray-500 font-normal">/ mo</span></div>
            <p className="text-gray-500 mb-8 h-12">Perfect for testing the waters and quick translations.</p>
            <ul className="space-y-5 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-gray-500" /><span>Standard AI Model</span></li>
              <li className="flex gap-4 text-gray-300 items-center"><Check size={20} className="text-gray-500" /> <span>Translate 1 language</span></li>
              <li className="flex gap-4 text-gray-300 items-center"><Check size={20} className="text-gray-500" /> <span>"Modern Slang" Vibe</span></li>
              <li className="flex gap-4 text-gray-600 items-center"><X size={20} /> <span>No CSV Export</span></li>
            </ul>
            <Link href="/auth?mode=signup" className="w-full block text-center py-4 rounded-xl border border-gray-700 hover:bg-gray-800 hover:text-white cursor-pointer font-bold transition-all">Start for Free</Link>
          </div>

          {/* Pro Tier */}
          <div className="p-10 rounded-3xl border border-yellow-400 bg-gray-900/30 relative flex flex-col shadow-2xl shadow-yellow-400/5">
            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-extrabold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-wider">MOST POPULAR</div>
            <h3 className="text-2xl font-bold text-white">Pro Suite</h3>
            <div className="text-5xl font-bold mt-6 mb-4 text-yellow-400">$10 <span className="text-lg text-gray-400 font-normal text-white">/ mo</span></div>
            <p className="text-gray-300 mb-8 h-12">For creators & marketers who need to scale.</p>
            <ul className="space-y-5 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-white font-bold"><Zap size={18} className="text-yellow-400" /><span>Superior AI Model</span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>Unlimited</strong> Languages</span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>All 7 Vibes</strong></span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>Download CSV Reports</strong></span></li>
            </ul>
            <Link href="/auth?mode=signup&intent=pro" className="w-full block text-center py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold cursor-pointer transition-all shadow-lg hover:shadow-yellow-400/20">Upgrade to Pro</Link>
          </div>
        </div>
      </div>

      {/* 📧 Footer */}
      <footer className="w-full text-center py-8 border-t border-gray-900 mt-auto opacity-50 hover:opacity-100 transition-opacity">
        <div className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-900 grid grid-cols-2 md:grid-cols-4 gap-4 text-left mb-8">
            <span className="col-span-full text-xs font-bold text-gray-500 uppercase mb-2">Popular Languages</span>
            <Link href="/translate/spanish" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Spanish Translator</Link>
            <Link href="/translate/french" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">French Translator</Link>
            <Link href="/translate/german" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">German Translator</Link>
            <Link href="/translate/japanese" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Japanese Translator</Link>
        </div>
        <p className="text-xs text-gray-600">Need help? <a href="mailto:teamz@buzztate.com" className="text-gray-400 hover:text-yellow-400 transition-colors">teamz@buzztate.com</a></p>
        <p className="text-[10px] text-gray-700 mt-2">© 2025 Buzztate. All rights reserved.</p>
      </footer>
    </div>
  );
}