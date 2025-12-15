import { Link, useLocation } from "wouter";
import { Check, X, Zap, Globe, Lock } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  // ---------------------------------------------------------
  // 🧠 LOGIC SECTION
  // ---------------------------------------------------------
  const handleCheckout = async () => {
    setLoading(true);

    // 1. Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();

    // 2. If not, kick them to the login page
    if (!session) {
      alert("Please create an account or log in before upgrading!");
      setLocation("/auth");
      return;
    }

    // 3. If yes, proceed to Stripe
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

  // ---------------------------------------------------------
  // 🎨 UI SECTION
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black">

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">⚡</span>
          <span className="font-bold text-xl tracking-tight">Buzztate</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth">
            <span className="text-sm font-bold text-gray-400 hover:text-white cursor-pointer transition-colors pt-2">Log In</span>
          </Link>
          <button onClick={handleCheckout} disabled={loading} className="bg-yellow-400 hover:bg-yellow-300 text-black px-5 py-2 rounded-full font-bold text-sm cursor-pointer transition-all disabled:opacity-50">
            {loading ? "Loading..." : "Get Started"}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mt-20 px-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Don't just translate. <br />
          <span className="text-yellow-400">Localize the Vibe.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          The only AI engine that adapts your content into Gen Z Slang, Corporate Speak, or Marketing Copy across 30+ languages instantly.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/auth">
            <span className="px-8 py-4 rounded-xl border border-gray-700 hover:border-white text-white font-bold cursor-pointer transition-all">
              Try for Free
            </span>
          </Link>
          <button onClick={handleCheckout} disabled={loading} className="px-8 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold cursor-pointer transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50">
            {loading ? "Redirecting..." : "Get Pro Access - $10/mo"}
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-400">
            <Globe size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Mass Localization</h3>
          <p className="text-gray-400">One input. 30+ global outputs. Scale your content instantly.</p>
        </div>
        <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-400">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Vibe Matching</h3>
          <p className="text-gray-400">Don't sound robotic. Sound like a local, an executive, or an influencer.</p>
        </div>
        <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
          <div className="w-12 h-12 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-400">
            <Lock size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
          <p className="text-gray-400">Your data is processed securely and never trained on without permission.</p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-5xl mx-auto px-6 mt-32 mb-20">
        <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Free Tier */}
          <div className="p-8 rounded-3xl border border-gray-800 bg-black flex flex-col">
            <h3 className="text-2xl font-bold text-gray-400">Starter</h3>
            <div className="text-4xl font-bold mt-4 mb-2">$0 <span className="text-lg text-gray-500 font-normal">/ month</span></div>
            <p className="text-gray-500 mb-8">Perfect for testing the waters.</p>

            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex gap-3 text-gray-300"><Check size={20} /> Translate 1 language at a time</li>
              <li className="flex gap-3 text-gray-300"><Check size={20} /> Access "Modern Slang" vibe only</li>
              <li className="flex gap-3 text-gray-500"><X size={20} /> No CSV Export</li>
              <li className="flex gap-3 text-gray-500"><X size={20} /> No Bulk Processing</li>
            </ul>

            <Link href="/auth">
              <span className="w-full block text-center py-4 rounded-xl border border-gray-700 hover:bg-gray-900 cursor-pointer font-bold transition-all">
                Start for Free
              </span>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl border border-yellow-400 bg-gray-900/20 relative flex flex-col">
            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white">Pro Suite</h3>
            <div className="text-4xl font-bold mt-4 mb-2">$10 <span className="text-lg text-gray-500 font-normal">/ month</span></div>
            <p className="text-gray-400 mb-8">For serious creators & marketers.</p>

            <ul className="space-y-4 mb-8 flex-grow">
              <li className="flex gap-3 text-white"><Check size={20} className="text-yellow-400" /> <strong>Unlimited</strong> Languages at once</li>
              <li className="flex gap-3 text-white"><Check size={20} className="text-yellow-400" /> <strong>All Vibes</strong> (Gen Z, Corporate, etc)</li>
              <li className="flex gap-3 text-white"><Check size={20} className="text-yellow-400" /> <strong>Download CSV Reports</strong></li>
              <li className="flex gap-3 text-white"><Check size={20} className="text-yellow-400" /> Priority Server Access</li>
            </ul>

            <button onClick={handleCheckout} disabled={loading} className="w-full block text-center py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold cursor-pointer transition-all shadow-lg disabled:opacity-50">
              {loading ? "Loading..." : "Upgrade to Pro"}
            </button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 py-10 text-center text-gray-600 text-sm">
        © 2025 Buzztate Inc.
      </div>
    </div>
  );
}