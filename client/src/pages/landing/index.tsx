import { Link } from "wouter";
import { Check, X, ArrowRight, ChevronDown, Globe, ShoppingBag, Store, FileSpreadsheet, Zap, Upload, Download, Shield, Mail } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    question: "Is this just Google Translate?",
    answer: "No. Google Translate does word-for-word translation. Buzztate is a marketplace-aware localization engine. It understands Amazon's search algorithm, Shopify SEO, and Etsy's tag system. It adapts your listings culturally — using formal address in German, compound nouns, local measurement units, and search keywords that actual shoppers use in each market."
  },
  {
    question: "Can I import the files back to Amazon/Shopify/Etsy?",
    answer: "Yes. Buzztate exports in the exact format each platform expects. For Amazon, you get a tab-delimited flat file matching Seller Central's import format. For Shopify, a CSV with Handle, Title, Body (HTML), and Tags columns. For Etsy, a CSV matching their bulk edit format. Upload directly — no reformatting needed."
  },
  {
    question: "What languages and marketplaces do you support?",
    answer: "We currently support Amazon Germany (.de), France (.fr), Spain (.es), Italy (.it), and Japan (.co.jp), plus Shopify and Etsy international stores. Languages include German, French, Spanish, Italian, Japanese, Portuguese, Dutch, and many more."
  },
  {
    question: "How is this different from hiring a translator?",
    answer: "Speed, cost, and marketplace expertise. A human translator charges £50-200 per listing and takes days. Buzztate localizes 100 listings in minutes for £29/month. More importantly, most translators don't understand Amazon SEO or marketplace-specific formatting rules — Buzztate does."
  },
  {
    question: "Will my brand name get translated?",
    answer: "No. Buzztate has a 'Do Not Translate' option for brand names, SKUs, ASINs, UPCs, and other fields that should stay in their original form. You control exactly which columns get localized during the column mapping step."
  },
];

const MARKETPLACES = [
  { name: "Amazon.de", flag: "🇩🇪" },
  { name: "Amazon.fr", flag: "🇫🇷" },
  { name: "Amazon.es", flag: "🇪🇸" },
  { name: "Amazon.it", flag: "🇮🇹" },
  { name: "Amazon.co.jp", flag: "🇯🇵" },
  { name: "Shopify", flag: "🛍️" },
  { name: "Etsy", flag: "🎨" },
];

export default function Landing() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactMsg) return;
    const subject = `Buzztate Inquiry from ${contactName}`;
    const body = `${contactMsg}\n\n---\nSent via Buzztate Landing Page`;
    window.location.href = `mailto:teamz@buzztate.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black flex flex-col">

      {/* Navigation */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-3xl">⚡</span>
              <span className="font-bold text-xl tracking-tight">Buzztate</span>
              <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase ml-1">for Sellers</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How It Works</button>
            <button onClick={() => scrollToSection("marketplaces")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Marketplaces</button>
            <button onClick={() => scrollToSection("pricing")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</button>
            <button onClick={() => scrollToSection("faq")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">FAQ</button>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth?mode=login" className="text-sm font-bold text-gray-400 hover:text-white cursor-pointer transition-colors">
              Log In
            </Link>
            <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full font-bold text-sm transition-all">
              Try Free — 5 Listings
            </Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <div className="flex-grow flex flex-col items-center justify-start text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-8">
          <ShoppingBag size={14} /> Built for Amazon, Shopify & Etsy Sellers
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-5xl">
          Sell in Every Market. <br />
          <span className="text-yellow-400">Localize Your Listings in Minutes.</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your Amazon, Shopify, or Etsy listings. Get marketplace-optimized translations that actually convert. Not word-for-word — <strong className="text-white">localized to sell</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)] flex items-center gap-2">
            Try Free — 5 Listings <ArrowRight size={18} />
          </Link>
          <button onClick={() => scrollToSection("how-it-works")} className="px-8 py-4 rounded-xl border border-gray-700 hover:bg-gray-900 text-white font-bold transition-all">
            See How It Works
          </button>
        </div>

        {/* Marketplace badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {MARKETPLACES.map((m) => (
            <span key={m.name} className="text-xs bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full text-gray-400 flex items-center gap-2">
              <span>{m.flag}</span> {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* ============ PAIN POINT ============ */}
      <div className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
            Google Translate <span className="text-red-400">Loses</span> You Sales
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            See the difference between a literal translation and a marketplace-optimized localization for Amazon Germany.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Bad: Google Translate */}
            <div className="bg-black border border-red-500/20 rounded-2xl p-8 relative">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl uppercase">
                Google Translate
              </div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">English Original</p>
              <p className="text-gray-400 text-sm mb-6 italic">"Premium Stainless Steel Coffee Maker — Brews 12 Cups, Programmable Timer, Keep Warm Function"</p>
              <p className="text-xs text-red-400 uppercase font-bold mb-2">German (Literal)</p>
              <p className="text-white text-sm mb-6">"Premium Edelstahl Kaffee Hersteller — Braut 12 Tassen, Programmierbarer Timer, Warm Halten Funktion"</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-red-400"><X size={14} className="flex-shrink-0 mt-0.5" /> "Kaffee Hersteller" means "coffee manufacturer" — wrong compound noun</div>
                <div className="flex items-start gap-2 text-red-400"><X size={14} className="flex-shrink-0 mt-0.5" /> "Braut" means "bride" — not "brews"</div>
                <div className="flex items-start gap-2 text-red-400"><X size={14} className="flex-shrink-0 mt-0.5" /> Missing German search keywords shoppers actually use</div>
              </div>
            </div>

            {/* Good: Buzztate */}
            <div className="bg-black border border-green-500/20 rounded-2xl p-8 relative">
              <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl uppercase">
                Buzztate
              </div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">English Original</p>
              <p className="text-gray-400 text-sm mb-6 italic">"Premium Stainless Steel Coffee Maker — Brews 12 Cups, Programmable Timer, Keep Warm Function"</p>
              <p className="text-xs text-green-400 uppercase font-bold mb-2">German (Localized for Amazon.de)</p>
              <p className="text-white text-sm mb-6">"Premium Edelstahl Kaffeemaschine — 12 Tassen, Programmierbare Zeitschaltuhr, Warmhaltefunktion"</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-green-400"><Check size={14} className="flex-shrink-0 mt-0.5" /> "Kaffeemaschine" — correct German compound noun shoppers search for</div>
                <div className="flex items-start gap-2 text-green-400"><Check size={14} className="flex-shrink-0 mt-0.5" /> "Warmhaltefunktion" — natural German compound, not awkward word-by-word</div>
                <div className="flex items-start gap-2 text-green-400"><Check size={14} className="flex-shrink-0 mt-0.5" /> Under Amazon's 200-character title limit, optimized for A9 search</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ HOW IT WORKS ============ */}
      <div id="how-it-works" className="w-full py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Three steps. CSV in, marketplace-ready files out.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gray-900/30 border border-gray-800">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload size={28} className="text-yellow-400" />
              </div>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">Step 1</div>
              <h3 className="text-xl font-bold mb-3">Upload Your Listings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Export your listings as CSV or Excel from Amazon Seller Central, Shopify, or Etsy. Drop the file into Buzztate.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gray-900/30 border border-gray-800">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe size={28} className="text-yellow-400" />
              </div>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">Step 2</div>
              <h3 className="text-xl font-bold mb-3">Pick Target Marketplaces</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Select Amazon.de, Amazon.fr, Amazon.co.jp, Shopify, Etsy, or any supported marketplace. We know each one's rules.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gray-900/30 border border-gray-800">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download size={28} className="text-yellow-400" />
              </div>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">Step 3</div>
              <h3 className="text-xl font-bold mb-3">Download & Upload</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Download marketplace-ready files in the exact import format. Upload directly to Seller Central, Shopify, or Etsy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MARKETPLACE SUPPORT ============ */}
      <div id="marketplaces" className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            We Know Each Marketplace's Rules
          </h2>
          <p className="text-gray-400 mb-16 max-w-2xl mx-auto">
            Character limits, keyword patterns, search behavior, cultural expectations — Buzztate handles it all.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Amazon Germany", locale: "de-DE", flag: "🇩🇪", detail: "Compound nouns, formal 'Sie', TÜV/CE certs, metric units" },
              { name: "Amazon France", locale: "fr-FR", flag: "🇫🇷", detail: "Accented keywords, elegant copy, 'vous' address, EU formatting" },
              { name: "Amazon Spain", locale: "es-ES", flag: "🇪🇸", detail: "European Spanish, benefit-driven copy, emotional tone" },
              { name: "Amazon Italy", locale: "it-IT", flag: "🇮🇹", detail: "Lifestyle descriptions, design emphasis, formal 'Lei'" },
              { name: "Amazon Japan", locale: "ja-JP", flag: "🇯🇵", detail: "Keigo politeness, katakana brands, exhaustive specs, usage scenarios" },
              { name: "Shopify", locale: "Multi-market", flag: "🛍️", detail: "Google SEO optimized, HTML descriptions, meta titles & descriptions" },
              { name: "Etsy", locale: "International", flag: "🎨", detail: "13 tags per listing, artisan tone, story-driven descriptions" },
            ].map((mp) => (
              <div key={mp.name} className="bg-black border border-gray-800 rounded-xl p-6 text-left hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{mp.flag}</span>
                  <div>
                    <h3 className="font-bold text-white text-sm">{mp.name}</h3>
                    <p className="text-xs text-gray-500">{mp.locale}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{mp.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ FEATURES GRID ============ */}
      <div className="w-full py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-gray-700 transition-colors">
              <FileSpreadsheet size={24} className="text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">CSV/Excel Import</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Upload Amazon flat files, Shopify CSVs, or Etsy exports. Smart column detection maps your data automatically.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-gray-700 transition-colors">
              <Shield size={24} className="text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Quality Checks</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Every localized listing is checked against marketplace character limits. Flags fields that are too long, too short, or empty.</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-gray-700 transition-colors">
              <Zap size={24} className="text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Marketplace-Format Export</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Download in the exact format each platform expects — Amazon TSV, Shopify CSV, Etsy CSV, or XLSX with quality report.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ PRICING ============ */}
      <div id="pricing" className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-16">Start free. Upgrade when you're ready to scale.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-black flex flex-col">
              <h3 className="text-lg font-bold text-gray-400">Free</h3>
              <div className="text-4xl font-bold mt-4 mb-2">£0</div>
              <p className="text-gray-500 text-sm mb-6">Test the waters</p>
              <ul className="space-y-3 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-2 text-gray-400"><Check size={16} className="text-gray-500" /> 5 listings/month</li>
                <li className="flex items-center gap-2 text-gray-400"><Check size={16} className="text-gray-500" /> 2 languages</li>
                <li className="flex items-center gap-2 text-gray-600"><X size={16} /> No priority processing</li>
              </ul>
              <Link href="/auth?mode=signup" className="w-full block text-center py-3 rounded-xl border border-gray-700 hover:bg-gray-800 font-bold transition-all text-sm">
                Start Free
              </Link>
            </div>

            {/* Starter */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-black flex flex-col">
              <h3 className="text-lg font-bold text-white">Starter</h3>
              <div className="text-4xl font-bold mt-4 mb-2">£29<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <p className="text-gray-400 text-sm mb-6">Growing sellers</p>
              <ul className="space-y-3 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> 100 listings/month</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> 5 languages</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> All export formats</li>
              </ul>
              <Link href="/auth?mode=signup&intent=starter" className="w-full block text-center py-3 rounded-xl bg-white text-black font-bold transition-all text-sm hover:bg-gray-200">
                Get Started
              </Link>
            </div>

            {/* Growth */}
            <div className="p-8 rounded-2xl border border-yellow-400 bg-gray-900/30 flex flex-col relative shadow-2xl shadow-yellow-400/5">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wider">MOST POPULAR</div>
              <h3 className="text-lg font-bold text-white">Growth</h3>
              <div className="text-4xl font-bold mt-4 mb-2 text-yellow-400">£59<span className="text-lg text-gray-400 font-normal">/mo</span></div>
              <p className="text-gray-300 text-sm mb-6">Scaling internationally</p>
              <ul className="space-y-3 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> 500 listings/month</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> All languages</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> Priority processing</li>
              </ul>
              <Link href="/auth?mode=signup&intent=growth" className="w-full block text-center py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold transition-all text-sm shadow-lg">
                Upgrade to Growth
              </Link>
            </div>

            {/* Scale */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-black flex flex-col">
              <h3 className="text-lg font-bold text-white">Scale</h3>
              <div className="text-4xl font-bold mt-4 mb-2">£99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <p className="text-gray-400 text-sm mb-6">Enterprise sellers</p>
              <ul className="space-y-3 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> Unlimited listings</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> All languages</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> API access</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> Bulk processing</li>
              </ul>
              <Link href="/auth?mode=signup&intent=scale" className="w-full block text-center py-3 rounded-xl border border-gray-700 hover:bg-gray-800 font-bold transition-all text-sm">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============ FAQ ============ */}
      <div id="faq" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="bg-gray-900/50 rounded-xl border border-gray-800 transition-all duration-300 hover:border-gray-700">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-6 text-left cursor-pointer focus:outline-none"
                >
                  <span className="font-bold text-lg">{faq.question}</span>
                  <span className={`transition-transform duration-300 text-yellow-400 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown />
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ CONTACT ============ */}
      <div id="contact" className="bg-gray-900 py-24 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-400 mb-10">Questions about enterprise plans or custom marketplace support?</p>

          <form onSubmit={handleContactSubmit} className="bg-black p-8 rounded-2xl border border-gray-800 text-left space-y-4 shadow-xl">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Your Name</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Doe" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Message</label>
              <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} placeholder="I sell on Amazon EU and want to localize 500 listings..." rows={4} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none resize-none" />
            </div>
            <button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Mail size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="w-full py-16 border-t border-gray-900 mt-auto bg-black text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div>
            <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Marketplaces</span>
            <ul className="space-y-3">
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Listing Translation</Link></li>
              <li><Link href="/shopify-product-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Shopify Product Translation</Link></li>
              <li><Link href="/etsy-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Etsy Listing Translation</Link></li>
            </ul>
          </div>
          <div>
            <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Amazon Markets</span>
            <ul className="space-y-3">
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Germany (.de)</Link></li>
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon France (.fr)</Link></li>
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Japan (.co.jp)</Link></li>
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Spain (.es)</Link></li>
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Italy (.it)</Link></li>
            </ul>
          </div>
          <div>
            <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Resources</span>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection("pricing")} className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Pricing</button></li>
              <li><button onClick={() => scrollToSection("faq")} className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">FAQ</button></li>
              <li><button onClick={() => scrollToSection("contact")} className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Contact Us</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? <a href="mailto:teamz@buzztate.com" className="text-yellow-400 hover:underline transition-colors">teamz@buzztate.com</a>
          </p>
          <p className="text-xs text-gray-600 mt-2">© 2026 Buzztate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
