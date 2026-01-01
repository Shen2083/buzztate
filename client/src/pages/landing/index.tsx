import { Link } from "wouter";
import { Check, X, Zap, Globe, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  // --- DEMO WIDGET STATE ---
  const [demoText, setDemoText] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [demoLang, setDemoLang] = useState("Spanish");

  const handleDemoTranslate = async () => {
    if (!demoText.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: demoText,
          target_languages: [demoLang],
          style: "Modern Slang", // Force the 'fun' vibe for the demo
          // No userId passed -> Backend treats as anonymous/free
        }),
      });
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setDemoResult(data.results[0]);
      } else if (data.error) {
        alert(data.error); // Likely limit reached
      }
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
      <div className="flex-grow flex flex-col items-center justify-start text-center px-6 pt-16 pb-20">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-5xl">
          Don't just translate. <br />
          <span className="text-yellow-400">Localize the Vibe.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The AI engine that adapts your content into Gen Z Slang, Corporate Speak, or Marketing Copy instantly.
        </p>

        {/* 🚀 LIVE DEMO WIDGET */}
        <div className="w-full max-w-3xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden mb-12 transform hover:scale-[1.01] transition-transform duration-500">
          {/* Widget Header */}
          <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-800 flex justify-between items-center">
             <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
             </div>
             <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} className="text-yellow-400" /> Live Demo
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px]">
            {/* Input Area */}
            <div className="p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-800 bg-black/40">
               <textarea 
                 className="w-full flex-grow bg-transparent outline-none text-lg resize-none placeholder-gray-600 font-light"
                 placeholder="Type something boring here... (e.g. 'Hello, I would like to schedule a meeting.')"
                 value={demoText}
                 onChange={(e) => setDemoText(e.target.value)}
                 maxLength={280}
               />
               <div className="mt-4 flex justify-between items-center">
                 <span className="text-xs text-gray-600">{demoText.length}/280 chars</span>
                 {/* Language Selector for Demo */}
                 <select 
                   value={demoLang}
                   onChange={(e) => setDemoLang(e.target.value)}
                   className="bg-gray-800 text-xs text-gray-300 rounded px-2 py-1 border border-gray-700 outline-none"
                 >
                   <option>Spanish</option>
                   <option>French</option>
                   <option>German</option>
                   <option>Japanese</option>
                 </select>
               </div>
            </div>

            {/* Output Area */}
            <div className="p-6 flex flex-col bg-gray-900/50 relative">
               {demoLoading ? (
                 <div className="flex-grow flex items-center justify-center text-yellow-400 animate-pulse gap-2">
                   <Loader2 className="animate-spin" /> Translating Vibe...
                 </div>
               ) : demoResult ? (
                 <>
                   <div className="flex-grow text-left">
                     <div className="text-xs font-bold text-yellow-400 uppercase mb-2">✨ {demoResult.language} (Modern Slang)</div>
                     <p className="text-xl text-white font-medium leading-relaxed">"{demoResult.translation}"</p>
                     <div className="mt-4 p-3 bg-black/40 rounded border border-white/5">
                       <p className="text-[10px] text-gray-500 uppercase font-bold">Literal Meaning</p>
                       <p className="text-sm text-gray-400 italic">"{demoResult.reality_check}"</p>
                     </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                     <p className="text-xs text-gray-500 mb-2">Want 7 other vibes & unlimited text?</p>
                     <Link href="/auth?mode=signup" className="text-xs font-bold text-yellow-400 hover:underline">Create Free Account →</Link>
                   </div>
                 </>
               ) : (
                 <div className="flex-grow flex flex-col items-center justify-center text-gray-600 opacity-50">
                   <Globe size={48} className="mb-4 text-gray-700" />
                   <p className="text-sm">Translation will appear here.</p>
                 </div>
               )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end">
            <button 
              onClick={handleDemoTranslate}
              disabled={demoLoading || !demoText}
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {demoLoading ? "Processing..." : "Translate Now"} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Standard CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
          <Link 
            href="/auth?mode=signup" 
            className="flex-1 w-full px-8 py-4 rounded-xl border border-gray-700 hover:bg-gray-900 text-white font-bold cursor-pointer transition-all text-center flex items-center justify-center"
          >
            Try for Free
          </Link>
          <Link 
            href="/auth?mode=signup&intent=pro" 
            className="flex-1 w-full px-8 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] text-center flex items-center justify-center cursor-pointer"
          >
            Get Pro - $10/mo
          </Link>
        </div>
      </div>

      {/* SEO Content Section - Helps rank for "Bulk Translation" keywords */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center border-t border-gray-900">
        <h2 className="text-3xl font-bold mb-6">How to Translate into Multiple Languages at Once</h2>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          Most translators force you to copy-paste text one language at a time. 
          <strong>Buzztate</strong> is different. Our AI engine allows you to 
          <span className="text-white font-bold"> translate into multiple languages at once</span> 
          with a single click.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <div className="text-yellow-400 font-bold text-xl mb-2">1. Paste Text</div>
            <p className="text-gray-500 text-sm">Input your email, marketing copy, or slogan into the dashboard.</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <div className="text-yellow-400 font-bold text-xl mb-2">2. Select Languages</div>
            <p className="text-gray-500 text-sm">Tick the boxes for Spanish, French, German, or 30+ others simultaneously.</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
            <div className="text-yellow-400 font-bold text-xl mb-2">3. Localize</div>
            <p className="text-gray-500 text-sm">Get perfectly adapted translations for every region instantly.</p>
          </div>
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
              <li className="flex items-center gap-3 text-gray-400">
                <Check size={18} className="text-gray-500" />
                <span>Standard AI Model</span>
              </li>
              <li className="flex gap-4 text-gray-300 items-center"><Check size={20} className="text-gray-500" /> <span>Translate 1 language</span></li>
              <li className="flex gap-4 text-gray-300 items-center"><Check size={20} className="text-gray-500" /> <span>"Modern Slang" Vibe</span></li>
              <li className="flex gap-4 text-gray-600 items-center"><X size={20} /> <span>No CSV Export</span></li>
              <li className="flex gap-4 text-gray-600 items-center"><X size={20} /> <span>No Bulk Processing</span></li>
            </ul>

            <Link href="/auth?mode=signup" className="w-full block text-center py-4 rounded-xl border border-gray-700 hover:bg-gray-800 hover:text-white cursor-pointer font-bold transition-all">
              Start for Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-10 rounded-3xl border border-yellow-400 bg-gray-900/30 relative flex flex-col shadow-2xl shadow-yellow-400/5">
            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-extrabold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-wider">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white">Pro Suite</h3>
            <div className="text-5xl font-bold mt-6 mb-4 text-yellow-400">$10 <span className="text-lg text-gray-400 font-normal text-white">/ mo</span></div>
            <p className="text-gray-300 mb-8 h-12">For creators & marketers who need to scale.</p>

            <ul className="space-y-5 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-white font-bold">
                <Zap size={18} className="text-yellow-400" />
                <span>Superior AI Model</span>
              </li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>Unlimited</strong> Languages</span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>All 7 Vibes</strong> (Pro + Gen Z)</span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>Download CSV Reports</strong></span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span>Priority Server Access</span></li>
            </ul>

            <Link 
              href="/auth?mode=signup&intent=pro" 
              className="w-full block text-center py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold cursor-pointer transition-all shadow-lg hover:shadow-yellow-400/20"
            >
              Upgrade to Pro
            </Link>
          </div>

        </div>
      </div>

      {/* 📧 Footer Contact */}
      <footer className="w-full text-center py-8 border-t border-gray-900 mt-auto opacity-50 hover:opacity-100 transition-opacity">
        <div className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-900 grid grid-cols-2 md:grid-cols-4 gap-4 text-left mb-8">
            <span className="col-span-full text-xs font-bold text-gray-500 uppercase mb-2">Popular Languages</span>

            <Link href="/translate/spanish" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Spanish Translator</Link>
            <Link href="/translate/french" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">French Translator</Link>
            <Link href="/translate/german" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">German Translator</Link>
            <Link href="/translate/japanese" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Japanese Translator</Link>
            <Link href="/translate/italian" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Italian Translator</Link>
            <Link href="/translate/chinese" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Chinese Translator</Link>
            <Link href="/translate/portuguese" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Portuguese Translator</Link>
            <Link href="/translate/russian" className="text-gray-600 hover:text-yellow-400 text-sm transition-colors">Russian Translator</Link>
        </div>
        <p className="text-xs text-gray-600">
          Need help? <a href="mailto:teamz@buzztate.com" className="text-gray-400 hover:text-yellow-400 transition-colors">teamz@buzztate.com</a>
        </p>
        <p className="text-[10px] text-gray-700 mt-2">© 2025 Buzztate. All rights reserved.</p>
      </footer>
    </div>
  );
}