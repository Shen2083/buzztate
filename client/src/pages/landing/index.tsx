import { Link } from "wouter";
import { Check, X, Zap, Globe, Lock } from "lucide-react";

export default function Landing() {
  // ⚡ Logic removed: We now handle everything via URL "intents" 
  // passed to the Auth and Home pages.

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
            {/* 1. Log In -> Explicitly asks for 'login' mode */}
            <Link href="/auth?mode=login" className="text-sm font-bold text-gray-400 hover:text-white cursor-pointer transition-colors">
              Log In
            </Link>
            {/* 2. Get Started -> Explicitly asks for 'signup' mode */}
            <Link 
              href="/auth?mode=signup" 
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full font-bold text-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-5xl">
          Don't just translate. <br />
          <span className="text-yellow-400">Localize the Vibe.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          <strong>Translate into multiple languages at once.</strong> <br/>
          The AI engine that adapts your content into Gen Z Slang, Corporate Speak, or Marketing Copy across 30+ languages instantly.
        </p>
        {/* Buttons - Updated to use Links with Intent */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
          {/* 3. Try For Free -> Standard Signup */}
          <Link 
            href="/auth?mode=signup" 
            className="flex-1 w-full px-8 py-4 rounded-xl border border-gray-700 hover:bg-gray-900 text-white font-bold cursor-pointer transition-all text-center flex items-center justify-center"
          >
            Try for Free
          </Link>

          {/* 4. Get Pro -> Signup + Intent to Checkout */}
          <Link 
            href="/auth?mode=signup&intent=pro" 
            className="flex-1 w-full px-8 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] text-center flex items-center justify-center cursor-pointer"
          >
            Get Pro - $10/mo
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-black border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 text-yellow-400">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Mass Localization</h3>
            <p className="text-gray-400 leading-relaxed">One input. 30+ global outputs. Scale your content instantly without copy-pasting 50 times.</p>
          </div>
          <div className="p-8 rounded-2xl bg-black border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 text-yellow-400">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Vibe Matching</h3>
            <p className="text-gray-400 leading-relaxed">Don't sound robotic. Sound like a local, an executive, or an influencer with our Vibe Engine.</p>
          </div>
          <div className="p-8 rounded-2xl bg-black border border-gray-800 hover:border-gray-700 transition-colors">
            <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 text-yellow-400">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
            <p className="text-gray-400 leading-relaxed">Your data is processed securely via HTTPS and never used for training without permission.</p>
          </div>
        </div>
      </div>
      {/* SEO Content Section - Helps rank for "Bulk Translation" keywords */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
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
              {/* ✨ Added AI Distinction */}
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
              {/* ✨ Added AI Distinction */}
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