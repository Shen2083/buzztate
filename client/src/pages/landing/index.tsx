import { Link } from "wouter";
import {
  Check, X, ArrowRight, ChevronDown, Globe, ShoppingBag,
  FileSpreadsheet, Zap, Upload, Download, Shield, Mail,
  ArrowRightLeft, AlertTriangle, RefreshCw,
} from "lucide-react";
import { useState } from "react";

// ---- Data ----

const FAQS = [
  {
    question: "Is this just Google Translate with a CSV wrapper?",
    answer: "No. Buzztate uses marketplace-specific AI that understands how shoppers search on each platform. A German Amazon shopper searches differently to a German Google user. We optimize for marketplace conversion, not just linguistic accuracy.",
  },
  {
    question: "Can I upload Etsy listings and get Amazon files?",
    answer: "Yes — cross-platform conversion is one of our core features. Upload from any supported platform and download files formatted for any other. We even generate missing fields, like creating Amazon bullet points from your Etsy descriptions.",
  },
  {
    question: "What happens to fields like SKU, price, and images?",
    answer: "They pass through unchanged. We only localize text content — titles, descriptions, bullet points, tags, and keywords. Your SKUs, prices, image URLs, and platform-specific settings are preserved exactly as they are.",
  },
  {
    question: "How is this different from hiring a translator?",
    answer: "Speed and marketplace expertise. A translator gives you accurate language. Buzztate gives you marketplace-optimized listings with the right keywords, character limits, and cultural tone for each platform. Plus it handles 200 listings in minutes, not weeks.",
  },
  {
    question: "What if I'm on the Free plan?",
    answer: "You get 5 listings per month into 1 marketplace. Enough to test the quality with your actual products before committing.",
  },
  {
    question: "Can I request a new marketplace?",
    answer: "Absolutely. We're adding new markets based on seller demand. Use the request form and we'll notify you when your market goes live.",
  },
];

const FIELD_MAPPING_ROWS = [
  { etsy: "Title", arrow: true, amazon: "item_name (localized)", highlight: true },
  { etsy: "Description (long form)", arrow: true, amazon: "product_description (localized)", highlight: true },
  { etsy: "", arrow: true, amazon: "bullet_point1 (generated)", highlight: true },
  { etsy: "", arrow: true, amazon: "bullet_point2 (generated)", highlight: true },
  { etsy: "", arrow: true, amazon: "bullet_point3 (generated)", highlight: true },
  { etsy: "", arrow: true, amazon: "bullet_point4 (generated)", highlight: true },
  { etsy: "", arrow: true, amazon: "bullet_point5 (generated)", highlight: true },
  { etsy: "Tags", arrow: true, amazon: "generic_keywords (localized)", highlight: true },
  { etsy: "SKU", arrow: true, amazon: "sku (pass-through)", highlight: false },
  { etsy: "Price", arrow: true, amazon: "standard_price (pass-through)", highlight: false },
];

const MARKET_INSIGHTS = [
  { flag: "\u{1F1E9}\u{1F1EA}", country: "Germany", insight: "Compound search terms like 'Espressomaschine' rank higher than separated words" },
  { flag: "\u{1F1EB}\u{1F1F7}", country: "France", insight: "Formal 'vous' address and accent-correct keywords" },
  { flag: "\u{1F1EA}\u{1F1F8}", country: "Spain", insight: "European Spanish, not Latin American — different search patterns" },
  { flag: "\u{1F1EE}\u{1F1F9}", country: "Italy", insight: "Lifestyle-driven descriptions that emphasize design and craftsmanship" },
  { flag: "\u{1F1EF}\u{1F1F5}", country: "Japan", insight: "Detailed specifications and polite keigo language that Japanese shoppers expect" },
];

export default function Landing() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-400 selection:text-black flex flex-col">

      {/* ============ NAVIGATION ============ */}
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
            <button onClick={() => scrollToSection("platforms")} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Platforms</button>
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
          <ArrowRightLeft size={14} /> Cross-Platform Listing Localization
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight max-w-5xl">
          One Upload. Every Marketplace. <br />
          <span className="text-yellow-400">Every Language.</span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your Amazon, Shopify, or Etsy listings. Get localized, marketplace-ready files for 5 international markets.
          Buzztate doesn't just translate — it <strong className="text-white">converts your listings across platforms</strong> and generates missing fields automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)] flex items-center gap-2">
            Try Free — 5 Listings <ArrowRight size={18} />
          </Link>
          <button onClick={() => scrollToSection("how-it-works")} className="px-8 py-4 rounded-xl border border-gray-700 hover:bg-gray-900 text-white font-bold transition-all">
            See How It Works
          </button>
        </div>

        {/* Animated flow visual */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {/* Source */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl px-5 py-3 text-sm">
              <span className="text-gray-500 text-xs block mb-1">Source</span>
              <span className="text-white font-bold">Etsy CSV</span>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ArrowRight size={20} className="text-yellow-400 hidden md:block" />
              <ChevronDown size={20} className="text-yellow-400 md:hidden" />
            </div>

            {/* Buzztate */}
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-5 py-3 text-sm">
              <span className="text-yellow-400 font-extrabold">⚡ Buzztate</span>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ArrowRight size={20} className="text-yellow-400 hidden md:block" />
              <ChevronDown size={20} className="text-yellow-400 md:hidden" />
            </div>

            {/* Outputs */}
            <div className="flex flex-col gap-2">
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-xs flex items-center gap-2">
                <span>🇩🇪</span> <span className="text-gray-300 font-mono">amazon_de.tsv</span>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-xs flex items-center gap-2">
                <span>🇫🇷</span> <span className="text-gray-300 font-mono">amazon_fr.tsv</span>
              </div>
              <div className="bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2 text-xs flex items-center gap-2">
                <span>🛍️</span> <span className="text-gray-300 font-mono">shopify_it.csv</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SECTION 1: THE PROBLEM ============ */}
      <div className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
            Expanding internationally shouldn't take weeks
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Three problems every cross-border seller faces.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-5">
                <X size={22} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Translation tools miss the point</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Google Translate gives you words. Sellers need marketplace-optimized listings with the right keywords, character limits, and cultural tone for each market.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-5">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Every platform has different rules</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Amazon wants 5 bullet points under 500 characters. Etsy wants 13 tags under 20 characters each. Shopify needs SEO meta descriptions at 160 characters. One listing format doesn't fit all.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-5">
                <RefreshCw size={22} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-3">Cross-platform expansion is manual hell</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Selling on Etsy and want to expand to Amazon? You'd have to rewrite every listing from scratch — different format, different fields, different structure. Until now.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SECTION 2: THREE SUPERPOWERS ============ */}
      <div className="w-full py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
            Three things Buzztate does that no translation tool can
          </h2>
          <p className="text-gray-400 text-center mb-20 max-w-2xl mx-auto">
            It's not a translator. It's a cross-platform listing converter with built-in localization.
          </p>

          {/* Superpower 1: Cross-Platform Conversion */}
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                <ArrowRightLeft size={20} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-extrabold">Cross-Platform Conversion</h3>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl leading-relaxed">
              Upload Etsy listings, download Amazon-ready files. Upload Shopify products, get Etsy-formatted listings. Buzztate automatically maps fields between platforms and generates any missing ones — like creating 5 Amazon bullet points from your Etsy description.
            </p>

            {/* Field mapping diagram */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden max-w-3xl">
              <div className="grid grid-cols-[1fr_auto_1fr] text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">
                <div className="px-6 py-3">Etsy Listing</div>
                <div className="px-4 py-3"></div>
                <div className="px-6 py-3">Amazon Listing (DE)</div>
              </div>
              {FIELD_MAPPING_ROWS.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-[1fr_auto_1fr] text-sm ${
                    i < FIELD_MAPPING_ROWS.length - 1 ? "border-b border-gray-800/50" : ""
                  }`}
                >
                  <div className={`px-6 py-2.5 ${row.etsy ? "text-gray-400" : "text-gray-700 italic"}`}>
                    {row.etsy || "—"}
                  </div>
                  <div className="px-4 py-2.5 flex items-center">
                    <ArrowRight size={14} className="text-yellow-400/60" />
                  </div>
                  <div className={`px-6 py-2.5 font-mono ${
                    row.highlight ? "text-yellow-400" : "text-gray-500"
                  }`}>
                    {row.amazon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Superpower 2: Marketplace-Aware Localization */}
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                <Globe size={20} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-extrabold">Marketplace-Aware Localization</h3>
            </div>
            <p className="text-gray-400 mb-8 max-w-3xl leading-relaxed">
              Not word-for-word translation. Buzztate knows that German Amazon shoppers search with compound words, that Japanese listings need 3x more detail, and that French descriptions should feel elegant. Each marketplace gets content optimized for how local shoppers actually search and buy.
            </p>

            {/* Flag insight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
              {MARKET_INSIGHTS.map((m) => (
                <div key={m.country} className="bg-black border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{m.flag}</span>
                    <span className="font-bold text-white text-sm">{m.country}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{m.insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Superpower 3: Quality Checks */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-extrabold">Quality Checks Built In</h3>
            </div>
            <p className="text-gray-400 max-w-3xl leading-relaxed">
              Every localized listing is checked against platform-specific rules. Character limits, required fields, keyword density — Buzztate flags issues before you upload to Seller Central. No more rejected listings or truncated titles.
            </p>
          </div>
        </div>
      </div>

      {/* ============ SECTION 3: HOW IT WORKS ============ */}
      <div id="how-it-works" className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Three steps. CSV in, marketplace-ready files out.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-black border border-gray-800">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload size={28} className="text-yellow-400" />
              </div>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">Step 1</div>
              <h3 className="text-xl font-bold mb-3">Upload your listings</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Export from Amazon Seller Central, Shopify Admin, or Etsy — CSV, XLSX, or TSV. Buzztate auto-detects your columns.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-black border border-gray-800">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe size={28} className="text-yellow-400" />
              </div>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">Step 2</div>
              <h3 className="text-xl font-bold mb-3">Pick your target marketplaces</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Select any combination: Amazon Germany, France, Spain, Italy, Japan. Plus Shopify and Etsy in any supported language. Localize into multiple markets in a single run.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-black border border-gray-800">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download size={28} className="text-yellow-400" />
              </div>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">Step 3</div>
              <h3 className="text-xl font-bold mb-3">Download marketplace-ready files</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get a ZIP with one file per marketplace, formatted for direct import. Amazon TSV, Shopify CSV, Etsy CSV — each in the exact format the platform expects. Upload and sell.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SECTION 4: BEFORE / AFTER ============ */}
      <div className="w-full py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">See the difference</h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            An Etsy bread bag listing converted and localized for Amazon Germany — with bullet points generated automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Original */}
            <div className="bg-black border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-bold uppercase">Original — Etsy English</span>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-gray-600 uppercase font-bold block mb-1">Title</span>
                  <p className="text-gray-300">Linen Bread Bag - Reusable Baguette & Loaf Storage, Handmade from European Flax, Keeps Bread Fresh 3x Longer, Zero Waste Kitchen</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase font-bold block mb-1">Description</span>
                  <p className="text-gray-500 text-xs leading-relaxed">Our handmade linen bread bag keeps your artisan bread, baguettes, and sourdough fresh up to 3x longer than plastic. Made from 100% European flax linen, hand-sewn with reinforced seams. Machine washable. Perfect zero-waste gift for bread lovers...</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase font-bold block mb-1">Tags</span>
                  <p className="text-gray-500 text-xs">bread bag, linen bag, reusable bread storage, baguette bag, sourdough keeper, zero waste kitchen...</p>
                </div>
                <div className="text-xs text-gray-700 italic pt-2 border-t border-gray-800/50">No bullet points — Etsy doesn't use them</div>
              </div>
            </div>

            {/* Localized */}
            <div className="bg-black border border-yellow-400/30 rounded-2xl p-8 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wider">BUZZTATE</div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full font-bold uppercase">Localized — Amazon Germany</span>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-yellow-400/60 uppercase font-bold block mb-1 font-mono">item_name</span>
                  <p className="text-white">Leinen Brottasche - Wiederverwendbare Baguette- & Laiblagerung, Handgefertigt aus Europäischem Flachs</p>
                </div>
                <div>
                  <span className="text-xs text-yellow-400/60 uppercase font-bold block mb-1 font-mono">bullet_point1</span>
                  <p className="text-yellow-400 text-xs">Hält Brot bis zu 3x länger frisch als Plastikverpackung — natürliche Luftzirkulation durch Leinengewebe</p>
                </div>
                <div>
                  <span className="text-xs text-yellow-400/60 uppercase font-bold block mb-1 font-mono">bullet_point2</span>
                  <p className="text-yellow-400 text-xs">100% europäisches Flachsleinen — handgenäht mit verstärkten Nähten für jahrelange Haltbarkeit</p>
                </div>
                <div>
                  <span className="text-xs text-yellow-400/60 uppercase font-bold block mb-1 font-mono">bullet_point3</span>
                  <p className="text-yellow-400 text-xs">Maschinenwaschbar bei 30°C — pflegeleicht und hygienisch</p>
                </div>
                <div>
                  <span className="text-xs text-yellow-400/60 uppercase font-bold block mb-1 font-mono">generic_keywords</span>
                  <p className="text-gray-400 text-xs">Brottasche Leinen, Brotbeutel wiederverwendbar, Baguettetasche, Brotaufbewahrung...</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-800/50">
                <p className="text-xs text-green-400 flex items-center gap-1.5">
                  <Check size={12} /> Bullet points generated from description. Ready for Seller Central import.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SECTION 5: SUPPORTED PLATFORMS ============ */}
      <div id="platforms" className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">Supported Platforms</h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 items-start max-w-4xl mx-auto">
            {/* Upload From */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Upload From</h3>
              <div className="space-y-3">
                {[
                  { icon: ShoppingBag, name: "Amazon", formats: ".csv / .tsv" },
                  { icon: FileSpreadsheet, name: "Shopify", formats: ".csv" },
                  { icon: Globe, name: "Etsy", formats: ".csv" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-3 bg-black border border-gray-800 rounded-xl px-5 py-4">
                    <p.icon size={18} className="text-gray-500" />
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="text-xs text-gray-600 ml-auto font-mono">{p.formats}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center h-full pt-10">
              <ArrowRight size={24} className="text-yellow-400" />
            </div>
            <div className="md:hidden flex justify-center">
              <ChevronDown size={24} className="text-yellow-400" />
            </div>

            {/* Localize To */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Localize To</h3>
              <div className="space-y-3">
                {[
                  { flag: "🇩🇪", name: "Amazon Germany" },
                  { flag: "🇫🇷", name: "Amazon France" },
                  { flag: "🇪🇸", name: "Amazon Spain" },
                  { flag: "🇮🇹", name: "Amazon Italy" },
                  { flag: "🇯🇵", name: "Amazon Japan" },
                  { flag: "🛍️", name: "Shopify (any language)" },
                  { flag: "🎨", name: "Etsy (any language)" },
                ].map((m) => (
                  <div key={m.name} className="flex items-center gap-3 bg-black border border-gray-800 rounded-xl px-5 py-3">
                    <span className="text-lg">{m.flag}</span>
                    <span className="text-sm text-gray-300">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-10">
            More marketplaces coming soon — <a href="mailto:teamz@buzztate.com?subject=Marketplace%20Request&body=I%27d%20like%20to%20request%20support%20for%3A%20" className="text-yellow-400/70 hover:text-yellow-400 underline underline-offset-2 transition-colors">request yours</a>.
          </p>
        </div>
      </div>

      {/* ============ SECTION 6: PRICING ============ */}
      <div id="pricing" className="w-full py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-16">Start free. Upgrade when you're ready to scale.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-black flex flex-col">
              <h3 className="text-lg font-bold text-gray-400">Free</h3>
              <div className="text-4xl font-bold mt-4 mb-2">$0</div>
              <p className="text-gray-500 text-sm mb-6">Try it out — no card needed</p>
              <ul className="space-y-3 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-2 text-gray-400"><Check size={16} className="text-gray-500" /> 5 listings/month</li>
                <li className="flex items-center gap-2 text-gray-400"><Check size={16} className="text-gray-500" /> 1 marketplace</li>
                <li className="flex items-center gap-2 text-gray-400"><Check size={16} className="text-gray-500" /> All export formats</li>
              </ul>
              <Link href="/auth?mode=signup" className="w-full block text-center py-3 rounded-xl border border-gray-700 hover:bg-gray-800 font-bold transition-all text-sm">
                Start Free
              </Link>
            </div>

            {/* Plus */}
            <div className="p-8 rounded-2xl border border-yellow-400 bg-gray-900/30 flex flex-col relative shadow-2xl shadow-yellow-400/5">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-extrabold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wider">MOST POPULAR</div>
              <h3 className="text-lg font-bold text-white">Plus</h3>
              <div className="text-4xl font-bold mt-4 mb-2 text-yellow-400">$49<span className="text-lg text-gray-400 font-normal">/mo</span></div>
              <p className="text-gray-300 text-sm mb-6">For serious sellers</p>
              <ul className="space-y-3 mb-8 flex-grow text-sm">
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> Unlimited listings</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> Up to 200 per batch</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> All supported marketplaces</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> All export formats</li>
                <li className="flex items-center gap-2 text-white"><Check size={16} className="text-yellow-400" /> Priority processing</li>
              </ul>
              <Link href="/auth?mode=signup&intent=plus" className="w-full block text-center py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold transition-all text-sm shadow-lg">
                Upgrade to Plus
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============ SECTION 7: FAQ ============ */}
      <div id="faq" className="w-full bg-gray-900/20 py-24 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="bg-black rounded-xl border border-gray-800 transition-all duration-300 hover:border-gray-700">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-6 text-left cursor-pointer focus:outline-none"
                  >
                    <span className="font-bold text-lg pr-4">{faq.question}</span>
                    <span className={`transition-transform duration-300 text-yellow-400 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
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
      </div>

      {/* ============ SECTION 8: FINAL CTA ============ */}
      <div className="w-full py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Your listings. Every market. <span className="text-yellow-400">Ready in minutes.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">No credit card required.</p>
          <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-10 py-5 rounded-xl font-extrabold text-lg transition-all shadow-[0_0_30px_rgba(250,204,21,0.2)]">
            Try Free — 5 Listings <ArrowRight size={20} />
          </Link>
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
              <li><Link href="/amazon-de-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Germany (.de)</Link></li>
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon France (.fr)</Link></li>
              <li><Link href="/amazon-jp-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Japan (.co.jp)</Link></li>
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Spain (.es)</Link></li>
              <li><Link href="/amazon-listing-translation" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Amazon Italy (.it)</Link></li>
            </ul>
          </div>
          <div>
            <span className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Resources</span>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection("pricing")} className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Pricing</button></li>
              <li><button onClick={() => scrollToSection("faq")} className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">FAQ</button></li>
              <li><a href="mailto:teamz@buzztate.com" className="text-gray-500 hover:text-yellow-400 text-sm transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? <a href="mailto:teamz@buzztate.com" className="text-yellow-400 hover:underline transition-colors">teamz@buzztate.com</a>
          </p>
          <p className="text-xs text-gray-600 mt-2">&copy; 2026 Buzztate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
