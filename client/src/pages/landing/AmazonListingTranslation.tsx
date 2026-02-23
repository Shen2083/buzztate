import { Link } from "wouter";
import { ArrowLeft, Check, ShoppingBag, ArrowRight } from "lucide-react";

export default function AmazonListingTranslation() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Nav */}
      <nav className="p-6 border-b border-gray-800 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <Link href="/auth?mode=signup" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-sm">
          Try Free — 5 Listings
        </Link>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-6 py-20">
        <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 max-w-4xl leading-tight">
          Translate Amazon Listings for <span className="text-yellow-400">International Markets</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Expand to Amazon Europe and Japan with marketplace-optimized product listings that rank and convert — not word-for-word translations.
        </p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all flex items-center gap-2">
          Start Localizing <ArrowRight size={18} />
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Amazon Listing Translation Matters</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            If you're selling on Amazon.com and thinking about expanding to Amazon Europe (Germany, France, Spain, Italy) or Amazon Japan, the biggest mistake you can make is using Google Translate on your listings. Literal translations don't just sound awkward — they actively lose you sales.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Amazon's A9 and A10 search algorithms work differently in each market. German shoppers search using compound words like "Kaffeemaschine" — if your listing says "Kaffee Maschine" (two words), you won't appear in search results. Japanese shoppers expect exhaustively detailed listings with usage scenarios. French shoppers respond to elegant, brand-prestige-oriented copy.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Buzztate understands these differences. It's not a translator — it's a marketplace-aware localization engine built specifically for Amazon sellers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">What Buzztate Does Differently</h2>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Marketplace-Specific Keywords</strong><span className="text-gray-400"> — We don't just translate your keywords. We research what shoppers actually search for in each market and optimize your listing for those terms.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Character Limit Enforcement</strong><span className="text-gray-400"> — Amazon titles are limited to 200 characters. Bullet points to 500. Our system enforces these limits and flags any violations before you upload.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Cultural Adaptation</strong><span className="text-gray-400"> — German listings use formal 'Sie' address and metric measurements. Japanese listings use keigo (polite language) and include katakana for brand names. We handle all of this automatically.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Flat File Export</strong><span className="text-gray-400"> — Download a tab-delimited file that matches Amazon Seller Central's import format exactly. No reformatting, no manual copy-pasting.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Brand Protection</strong><span className="text-gray-400"> — Brand names, SKUs, ASINs, UPCs, and browse node IDs are never translated. You control exactly which fields get localized.</span></div></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Supported Amazon Marketplaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { market: "Amazon Germany (.de)", lang: "German", notes: "Compound nouns, formal address, TÜV/CE certifications" },
              { market: "Amazon France (.fr)", lang: "French", notes: "Accented keywords, elegant copy, EU number formatting" },
              { market: "Amazon Spain (.es)", lang: "European Spanish", notes: "Benefit-driven, emotional copy, usted form" },
              { market: "Amazon Italy (.it)", lang: "Italian", notes: "Lifestyle-oriented, design emphasis, Lei address" },
              { market: "Amazon Japan (.co.jp)", lang: "Japanese", notes: "Keigo politeness, katakana brands, exhaustive specs" },
            ].map((m) => (
              <div key={m.market} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="font-bold text-white text-sm mb-1">{m.market}</h3>
                <p className="text-xs text-yellow-400 mb-2">{m.lang}</p>
                <p className="text-xs text-gray-500">{m.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 1:</strong> Export your listings from Amazon Seller Central as a flat file (CSV or tab-delimited). You can export one product or your entire catalog.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 2:</strong> Upload the file to Buzztate. Our system auto-detects Amazon column headers (item_name, product_description, bullet_point1-5, generic_keyword) and maps them for you.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 3:</strong> Select your target marketplace (e.g., Amazon.de). Buzztate localizes every listing using marketplace-specific prompts that understand German search behavior, cultural norms, and formatting rules.
          </p>
          <p className="text-gray-400 leading-relaxed">
            <strong className="text-white">Step 4:</strong> Download the localized flat file and upload it directly to Seller Central. Your listings go live in the target market with optimized titles, descriptions, bullet points, and keywords.
          </p>
        </section>
      </div>

      {/* CTA */}
      <div className="py-20 text-center bg-gray-900/20 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">Ready to Sell on Amazon Worldwide?</h2>
        <p className="text-gray-400 mb-8">Start with 5 free listings. No credit card required.</p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all inline-flex items-center gap-2">
          Try Buzztate Free <ArrowRight size={18} />
        </Link>
      </div>

      <footer className="py-8 text-center border-t border-gray-900">
        <p className="text-xs text-gray-600">© 2026 Buzztate. All rights reserved.</p>
      </footer>
    </div>
  );
}
