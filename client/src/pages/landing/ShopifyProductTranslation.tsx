import { Link } from "wouter";
import { ArrowLeft, Check, Store, ArrowRight } from "lucide-react";

export default function ShopifyProductTranslation() {
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
          <Store size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 max-w-4xl leading-tight">
          Localize Your Shopify Store for <span className="text-yellow-400">Global Sales</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Translate your Shopify product catalog for international markets. Google SEO-optimized, culturally adapted, and ready to import.
        </p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all flex items-center gap-2">
          Start Localizing <ArrowRight size={18} />
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Shopify Store Translation Matters</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Shopify Markets makes it easy to sell internationally — but only if your product pages actually speak your customers' language. A Shopify store with English-only product descriptions targeting German or Japanese shoppers will see high bounce rates and low conversion.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Unlike Amazon, Shopify's product discovery is primarily Google-driven. This means your localized product descriptions need to be optimized for Google search in each target language — not just translated word-for-word. Long-tail keywords, natural language phrases, and proper SEO meta tags in the target language are essential.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Buzztate handles all of this. Upload your Shopify product CSV, select your target languages, and download a file ready to import back into Shopify — complete with localized titles, HTML descriptions, tags, SEO titles, and SEO descriptions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">What You Get with Buzztate for Shopify</h2>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Google SEO Optimization</strong><span className="text-gray-400"> — Product titles and descriptions are optimized for Google search in each target language, not just translated. Includes natural long-tail keywords.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">SEO Meta Tags</strong><span className="text-gray-400"> — Generates localized SEO meta titles (50-60 chars) and meta descriptions (150-160 chars) that drive click-through from search results.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">HTML Description Support</strong><span className="text-gray-400"> — Shopify descriptions support HTML formatting. Buzztate preserves and generates properly formatted HTML in the target language.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Shopify CSV Import Format</strong><span className="text-gray-400"> — Download a CSV with Handle, Title, Body (HTML), Tags, SEO Title, and SEO Description columns — ready to import via Shopify's bulk editor.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Multi-Market Support</strong><span className="text-gray-400"> — Translate to any language Shopify Markets supports. Buzztate adapts tone, measurement units, and cultural references for each locale.</span></div></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Supported Languages for Shopify</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Buzztate supports all major Shopify Markets languages including German, French, Spanish, Italian, Japanese, Portuguese, Chinese (Simplified), Korean, Dutch, Swedish, Danish, Norwegian, Finnish, Polish, Czech, Hungarian, Romanian, Turkish, Arabic, Hindi, Thai, Vietnamese, and Indonesian.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Each language is optimized for Google search in the corresponding locale. For example, French translations use proper accented characters and European French conventions, while Japanese translations include both kanji and hiragana variants of key search terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 1:</strong> Go to your Shopify admin, navigate to Products, and click "Export" to download your product catalog as a CSV file.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 2:</strong> Upload the CSV to Buzztate. We auto-detect Shopify columns (Title, Body HTML, Tags, etc.) and map them automatically.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 3:</strong> Select "Shopify (Multi-market)" as your target and choose your target language. Buzztate generates Google SEO-optimized translations for every product.
          </p>
          <p className="text-gray-400 leading-relaxed">
            <strong className="text-white">Step 4:</strong> Download the Shopify-format CSV and import it back through Shopify's bulk product editor or use the Shopify Markets translation feature.
          </p>
        </section>
      </div>

      {/* CTA */}
      <div className="py-20 text-center bg-gray-900/20 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">Ready to Go Global with Shopify?</h2>
        <p className="text-gray-400 mb-8">Start with 5 free product localizations. No credit card required.</p>
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
