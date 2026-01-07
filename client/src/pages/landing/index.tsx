import { Link } from "wouter";
import { Check, X, Zap, Globe, Lock, ArrowRight, Loader2, Sparkles, Wand2, FileText, Layers, BrainCircuit, Bot, ChevronDown, Mail } from "lucide-react";
import { useState } from "react";

// ✅ All 7 Vibes for Demo
const DEMO_VIBES = [
  "Modern Slang", 
  "Professional / Corporate", 
  "Gen Z Influencer", 
  "App Store Description", 
  "Marketing Copy", 
  "Romantic Poet", 
  "Angry New Yorker"
];

const DEMO_LANGS = ["Spanish", "French", "German", "Japanese", "Italian", "Chinese", "Arabic"];

export default function Landing() {
  // --- ADVANCED DEMO STATE ---
  const [demoText, setDemoText] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResults, setDemoResults] = useState<any[]>([]); 
  const [demoVibe, setDemoVibe] = useState("Modern Slang");
  const [demoSelectedLangs, setDemoSelectedLangs] = useState<string[]>(["Spanish", "French"]); 

  // --- CONTACT FORM STATE ---
  const [contactName, setContactName] = useState("");
  const [contactMsg, setContactMsg] = useState("");

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
      const requests = demoSelectedLangs.map(lang => 
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: demoText,
            target_languages: [lang], 
            style: demoVibe,
          }),
        }).then(res => res.json())
      );

      const responses = await Promise.all(requests);
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactMsg) return alert("Please fill in all fields");

    // Construct Mailto Link
    const subject = `Buzztate Inquiry from ${contactName}`;
    const body = `${contactMsg}\n\n---\nSent via Buzztate Landing Page`;
    window.location.href = `mailto:teamz@buzztate.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Helper for smooth scrolling
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // -------------------------

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black flex flex-col">

      {/* Navigation */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* ✅ CLICKABLE LOGO */}
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-3xl">⚡</span>
              <span className="font-bold text-xl tracking-tight">Buzztate</span>
            </div>
          </Link>

          {/* ✅ NAVIGATION LINKS */}
          <div className="hidden md:flex items-center gap-8">
             <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</button>
             <button onClick={() => scrollToSection('faq')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">FAQ</button>
             <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</button>
             <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Contact Us</button>
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
             <div className="flex items-center gap-3 shrink-0">
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

             {/* ✅ UPDATED: Scrollable Language List with Custom Arabic Button */}
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 sticky left-0 bg-gray-800/90 md:bg-transparent pl-2 md:pl-0 z-10">Target:</span>
                <div className="flex items-center gap-2 pr-4">
                  {DEMO_LANGS.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleDemoLang(lang)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        demoSelectedLangs.includes(lang) 
                        ? "bg-yellow-400 text-black border-yellow-400 font-bold" 
                        : "bg-black/50 text-gray-400 border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {lang === "Arabic" ? (
                        <>
                          <span>Arabic</span>
                          <span className="opacity-70 font-normal">(العربية)</span>
                          {/* NEW Badge for Arabic */}
                          {!demoSelectedLangs.includes(lang) && (
                             <span className="bg-yellow-500 text-black text-[8px] font-extrabold px-1 rounded ml-1 animate-pulse">NEW</span>
                          )}
                        </>
                      ) : (
                        lang
                      )}
                    </button>
                  ))}
                </div>
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
                        {/* ✅ Better RTL Support for Arabic */}
                        <p className={`text-white text-lg font-medium leading-relaxed mb-3 ${res.language === "Arabic" ? "text-right font-serif" : "text-left"}`}>
                          "{res.translation}"
                        </p>
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

      {/* ✅ FEATURES SECTION 1: The Core Grid */}
      <div id="features" className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
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

      {/* 🚀 DETAILED FEATURE SPOTLIGHTS */}
      <div className="w-full bg-black py-24">

        {/* Spotlight 1: Vibe Engine */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded bg-yellow-400/10 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-4">
                Beyond Literal Translation
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Stop sounding like a <br/><span className="text-gray-500">textbook robot.</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Standard translators ignore context. Buzztate preserves your "Brand Voice" even when switching languages.
              </p>

              <ul className="space-y-6">
                <li className="flex gap-4">
                   <div className="mt-1 bg-yellow-400 rounded-full p-1 h-fit"><Check size={12} className="text-black stroke-[3]" /></div>
                   <div>
                     <h4 className="font-bold text-white text-lg">7 Distinct Vibes</h4>
                     <p className="text-sm text-gray-500">From "Gen Z Influencer" to "Angry New Yorker" to "C-Suite Executive".</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1 bg-yellow-400 rounded-full p-1 h-fit"><Check size={12} className="text-black stroke-[3]" /></div>
                   <div>
                     <h4 className="font-bold text-white text-lg">Cultural Nuance Check</h4>
                     <p className="text-sm text-gray-500">Our AI explains the <em>literal</em> meaning of the slang so you don't accidentally offend anyone.</p>
                   </div>
                </li>
              </ul>
            </div>

            {/* Visual for Vibe */}
            <div className="relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-20"></div>
               <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                  {/* Message 1 */}
                  <div className="flex gap-4 mb-6 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"><Globe size={20} /></div>
                    <div className="bg-gray-800 p-4 rounded-xl rounded-tl-none max-w-sm">
                       <p className="text-xs text-gray-500 uppercase font-bold mb-1">Standard Translator</p>
                       <p className="text-gray-400">"Hello, how are you doing today?"</p>
                    </div>
                  </div>
                  {/* Message 2 */}
                  <div className="flex gap-4 justify-end">
                    <div className="bg-yellow-400 p-4 rounded-xl rounded-tr-none max-w-sm">
                       <p className="text-xs text-black/50 uppercase font-bold mb-1">Buzztate (Gen Z Vibe)</p>
                       <p className="text-black font-bold">"Yo bestie, what's the tea today? ✨"</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center"><Sparkles size={20} className="text-black"/></div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* 🚀 NEW SPOTLIGHT: Smart AI (Pro Model) */}
        <div className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual for Smart AI */}
            <div className="order-2 lg:order-1 relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-20"></div>
               <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl overflow-hidden">
                  <div className="flex flex-col gap-6">
                     <div className="bg-black/50 p-4 rounded-xl border border-gray-800 opacity-50">
                        <div className="flex justify-between mb-2">
                           {/* ✅ UPDATED: Changed GPT-3.5 to Basic AI */}
                           <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Bot size={10}/> Standard Model</span>
                           <span className="text-[10px] text-gray-600">Basic AI</span>
                        </div>
                        <p className="text-gray-400 text-sm italic">"The cat is out of the bag."</p>
                        <p className="text-gray-500 text-sm mt-1">↓ "El gato está fuera de la bolsa."</p>
                        <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-wider">❌ Literal translation (Lost meaning)</p>
                     </div>

                     <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 p-4 rounded-xl border border-yellow-400/30">
                        <div className="flex justify-between mb-2">
                           {/* ✅ UPDATED: Changed GPT-4o to Smart AI */}
                           <span className="text-[10px] font-bold text-yellow-400 uppercase flex items-center gap-1"><BrainCircuit size={10}/> Pro Model</span>
                           <span className="text-[10px] text-yellow-400">Smart AI</span>
                        </div>
                        <p className="text-white text-sm italic">"The cat is out of the bag."</p>
                        <p className="text-white text-sm mt-1">↓ "Se descubrió el pastel."</p>
                        <p className="text-[10px] text-green-400 mt-2 font-bold uppercase tracking-wider">✅ Correct cultural idiom</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 rounded bg-pink-500/10 text-pink-400 text-xs font-bold uppercase tracking-wider mb-4">
                Intelligence Upgrade
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Smarter AI understands <br/><span className="text-gray-500">idioms & irony.</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                {/* ✅ UPDATED: Changed GPT-4o to Smart AI */}
                Unlock the power of <strong>Smart AI</strong> with Buzztate Pro. It doesn't just translate words; it understands deep cultural context.
              </p>

              <ul className="space-y-6">
                <li className="flex gap-4">
                   <div className="mt-1 bg-pink-500 rounded-full p-1 h-fit"><BrainCircuit size={12} className="text-black stroke-[3]" /></div>
                   <div>
                     <h4 className="font-bold text-white text-lg">Idiom Detection</h4>
                     <p className="text-sm text-gray-500">Automatically converts metaphors like "break a leg" into the correct local equivalent.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1 bg-pink-500 rounded-full p-1 h-fit"><Check size={12} className="text-black stroke-[3]" /></div>
                   <div>
                     <h4 className="font-bold text-white text-lg">Complex Grammar</h4>
                     <p className="text-sm text-gray-500">Perfect handling of formal vs. informal pronouns (e.g., 'Tu' vs 'Usted').</p>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Spotlight 3: Workflow */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual for Workflow */}
            <div className="order-2 lg:order-2 relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
               <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                     <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                     </div>
                     <div className="text-xs text-gray-500 font-mono">export_2026.csv</div>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                     <div className="grid grid-cols-3 text-gray-500 text-xs uppercase font-bold">
                        <div>Language</div>
                        <div>Style</div>
                        <div>Output</div>
                     </div>
                     <div className="grid grid-cols-3 text-gray-300 border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2"><Globe size={12}/> Spanish</div>
                        <div className="text-yellow-400">Marketing</div>
                        <div className="truncate">¡Descubre la magia ahora!</div>
                     </div>
                     <div className="grid grid-cols-3 text-gray-300 border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2"><Globe size={12}/> French</div>
                        <div className="text-yellow-400">Corporate</div>
                        <div className="truncate">Nous vous prions d'agréer...</div>
                     </div>
                     <div className="grid grid-cols-3 text-gray-300 border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2"><Globe size={12}/> Japanese</div>
                        <div className="text-yellow-400">Slang</div>
                        <div className="truncate">マジでヤバい！</div>
                     </div>
                  </div>
                  <div className="mt-6 flex justify-center">
                     <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                        <FileText size={16}/> Download CSV
                     </button>
                  </div>
               </div>
            </div>

            <div className="order-1 lg:order-1">
              <div className="inline-block px-3 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                Enterprise Workflow
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Localization for <br/><span className="text-gray-500">speed demons.</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Don't waste hours copying and pasting. Buzztate is built for marketers and agencies who need results yesterday.
              </p>

              <ul className="space-y-6">
                <li className="flex gap-4">
                   <div className="mt-1 bg-blue-500 rounded-full p-1 h-fit"><Layers size={12} className="text-black stroke-[3]" /></div>
                   <div>
                     <h4 className="font-bold text-white text-lg">Bulk Processing</h4>
                     <p className="text-sm text-gray-500">Select 30+ languages and translate them all in a single click.</p>
                   </div>
                </li>
                <li className="flex gap-4">
                   <div className="mt-1 bg-blue-500 rounded-full p-1 h-fit"><FileText size={12} className="text-black stroke-[3]" /></div>
                   <div>
                     <h4 className="font-bold text-white text-lg">One-Click CSV Export</h4>
                     <p className="text-sm text-gray-500">Get a neat spreadsheet ready for your dev team or marketing dashboard.</p>
                   </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FAQ SECTION */}
      <div id="faq" className="max-w-4xl mx-auto px-6 py-20 border-b border-gray-900">
        <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
           {/* Q1 */}
           <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
             <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                   <span className="font-bold text-lg">How is this different from Google Translate?</span>
                   <span className="transition group-open:rotate-180"><ChevronDown /></span>
                </summary>
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                   Google Translate focuses on literal word-for-word translation, which often sounds robotic or loses meaning. Buzztate's <strong>Vibe Engine</strong> understands context, slang, and tone, ensuring your message lands correctly in any culture.
                </div>
             </details>
           </div>
           {/* Q2 */}
           <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
             <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                   <span className="font-bold text-lg">Is it free to use?</span>
                   <span className="transition group-open:rotate-180"><ChevronDown /></span>
                </summary>
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                   Yes! You can use the Starter plan for free to translate shorter texts. For unlimited languages, bulk processing, and CSV exports, you can upgrade to the Pro plan for just $10/mo.
                </div>
             </details>
           </div>
           {/* Q3 */}
           <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
             <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                   <span className="font-bold text-lg">Is my data secure?</span>
                   <span className="transition group-open:rotate-180"><ChevronDown /></span>
                </summary>
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                   Absolutely. We use enterprise-grade encryption for all data transmission. We do not store your translated content permanently, and we never use your data to train our public models without permission.
                </div>
             </details>
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
      <div id="pricing" className="max-w-5xl mx-auto px-6 py-32 w-full">
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

      {/* ✅ CONTACT FORM SECTION */}
      <div id="contact" className="bg-gray-900 py-24 border-t border-gray-800">
         <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-400 mb-10">Have questions about Enterprise plans or custom integrations?</p>

            <form onSubmit={handleContactSubmit} className="bg-black p-8 rounded-2xl border border-gray-800 text-left space-y-4 shadow-xl">
               <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Your Name</label>
                  <input 
                    type="text" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none"
                  />
               </div>
               <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Message</label>
                  <textarea 
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="I'm interested in the API access..."
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none resize-none"
                  />
               </div>
               <button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Mail size={18}/> Send Message
               </button>
            </form>
         </div>
      </div>

      {/* 📧 Footer */}
      <footer className="w-full text-center py-12 border-t border-gray-900 mt-auto bg-black">

        {/* Expanded Popular Languages Section (SEO Backlinks) */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
            <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Popular Language Translators</span>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center">
                <Link href="/translate/spanish" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Spanish Translator</Link>
                <Link href="/translate/french" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">French Translator</Link>
                <Link href="/translate/german" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">German Translator</Link>
                <Link href="/translate/japanese" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Japanese Translator</Link>
                <Link href="/translate/italian" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Italian Translator</Link>
                <Link href="/translate/chinese" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Chinese Translator</Link>
                <Link href="/translate/arabic" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Arabic Translator</Link>
                <Link href="/translate/portuguese" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Portuguese Translator</Link>
                <Link href="/translate/russian" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Russian Translator</Link>
                <Link href="/translate/hindi" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Hindi Translator</Link>
                <Link href="/translate/korean" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Korean Translator</Link>
                <Link href="/translate/dutch" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Dutch Translator</Link>
                <Link href="/translate/turkish" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Turkish Translator</Link>
                <Link href="/translate/polish" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Polish Translator</Link>
                <Link href="/translate/swedish" className="text-gray-500 hover:text-yellow-400 text-sm py-2 transition-colors">Swedish Translator</Link>
            </div>
        </div>

        {/* Contact & Copyright */}
        <div className="border-t border-gray-900 pt-8">
            <p className="text-sm text-gray-500 mb-2">
            Need help? <a href="mailto:teamz@buzztate.com" className="text-yellow-400 hover:underline transition-colors">teamz@buzztate.com</a>
            </p>
            {/* ✅ Updated Year to 2026 */}
            <p className="text-xs text-gray-600 mt-2">© 2026 Buzztate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}