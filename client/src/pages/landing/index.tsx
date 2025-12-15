import { Link, useLocation } from "wouter";
import { Check, X, Zap, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleCheckout = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert("Please create an account or log in before upgrading!");
      setLocation("/auth");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
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
        alert("Could not initiate checkout. Please check API keys.");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

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
            <Link href="/auth" className="text-sm font-bold text-gray-400 hover:text-white cursor-pointer transition-colors">
              Log In
            </Link>
            <button 
              onClick={handleCheckout} 
              disabled={loading} 
              className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get Started"}
            </button>
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
          The AI engine that adapts your content into Gen Z Slang, Corporate Speak, or Marketing Copy across 30+ languages instantly.
        </p>

        {/* Buttons - Fixed Alignment */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
          {/* Link behaves exactly like a button now */}
          <Link 
            href="/auth" 
            className="flex-1 w-full px-8 py-4 rounded-xl border border-gray-700 hover:bg-gray-900 text-white font-bold cursor-pointer transition-all text-center flex items-center justify-center"
          >
            Try for Free
          </Link>

          <button 
            onClick={handleCheckout} 
            disabled={loading} 
            className="flex-1 w-full px-8 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 text-center flex items-center justify-center"
          >
            {loading ? "..." : "Get Pro - $10/mo"}
          </button>
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
              <li className="flex gap-4 text-gray-300 items-center"><Check size={20} className="text-gray-500" /> <span>Translate 1 language</span></li>
              <li className="flex gap-4 text-gray-300 items-center"><Check size={20} className="text-gray-500" /> <span>"Modern Slang" Vibe</span></li>
              <li className="flex gap-4 text-gray-600 items-center"><X size={20} /> <span>No CSV Export</span></li>
              <li className="flex gap-4 text-gray-600 items-center"><X size={20} /> <span>No Bulk Processing</span></li>
            </ul>

            <Link href="/auth" className="w-full block text-center py-4 rounded-xl border border-gray-700 hover:bg-gray-800 hover:text-white cursor-pointer font-bold transition-all">
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
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>Unlimited</strong> Languages</span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>All 7 Vibes</strong> (Pro + Gen Z)</span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span><strong>Download CSV Reports</strong></span></li>
              <li className="flex gap-4 text-white items-center"><Check size={20} className="text-yellow-400" /> <span>Priority Server Access</span></li>
            </ul>

            <button 
              onClick={handleCheckout} 
              disabled={loading} 
              className="w-full block text-center py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold cursor-pointer transition-all shadow-lg hover:shadow-yellow-400/20 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Upgrade to Pro"}
            </button>
          </div>

        </div>
      </div>

      {/* 📧 Footer Contact */}
      <footer className="w-full text-center py-8 border-t border-gray-900 mt-auto opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-xs text-gray-600">
          Need help? <a href="mailto:teamz@buzztate.com" className="text-gray-400 hover:text-yellow-400 transition-colors">teamz@buzztate.com</a>
        </p>
        <p className="text-[10px] text-gray-700 mt-2">© 2025 Buzztate. All rights reserved.</p>
      </footer>
    </div>
  );
}