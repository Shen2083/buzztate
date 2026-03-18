import { Link } from "wouter";
import { ArrowLeft, Check, ShoppingBag, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function AmazonListingTranslation() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* JSON-LD: WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Amazon Listing Localization for Sellers",
            description: "Localize your Amazon listings with marketplace-aware AI. Keyword-optimized bullet points, titles, and descriptions for every Amazon marketplace.",
            url: "https://buzztate.com/amazon-listing-translation",
            isPartOf: { "@type": "WebSite", name: "Buzztate", url: "https://buzztate.com" },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://buzztate.com/" },
                { "@type": "ListItem", position: 2, name: "Amazon Listing Localization", item: "https://buzztate.com/amazon-listing-translation" },
              ],
            },
          }),
        }}
      />

      {/* JSON-LD: HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to Localize Amazon Listings for International Markets",
            description: "Localize your Amazon product listings for Germany, France, Spain, Italy, and Japan in 4 steps using Buzztate.",
            step: [
              { "@type": "HowToStep", position: 1, name: "Export listings", text: "Export your listings from Amazon Seller Central as a flat file (CSV or tab-delimited)." },
              { "@type": "HowToStep", position: 2, name: "Upload to Buzztate", text: "Upload the file to Buzztate. The system auto-detects Amazon column headers and maps them for you." },
              { "@type": "HowToStep", position: 3, name: "Select target marketplace", text: "Select your target marketplace (e.g., Amazon.de). Buzztate localizes every listing using marketplace-specific prompts." },
              { "@type": "HowToStep", position: 4, name: "Download and upload", text: "Download the localized flat file and upload it directly to Seller Central." },
            ],
            tool: { "@type": "SoftwareApplication", name: "Buzztate" },
          }),
        }}
      />

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

      {/* What is Amazon Listing Localization — structured for AI extraction */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">What is Amazon Listing Localization?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Amazon listing localization is the process of adapting product listings for international Amazon marketplaces (Germany, France, Spain, Italy, Japan). Unlike basic translation, localization includes marketplace-specific keyword research, cultural adaptation, character limit compliance, and format conversion to each marketplace's flat file structure. Buzztate automates this entire process.
          </p>
        </div>
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

        {/* Comparison table for AI extraction */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Buzztate vs Manual Translation vs Google Translate</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="text-left p-3 text-gray-400 font-medium">Feature</th>
                  <th className="text-center p-3 text-gray-400 font-medium">Google Translate</th>
                  <th className="text-center p-3 text-gray-400 font-medium">Freelancer</th>
                  <th className="text-center p-3 text-yellow-400 font-medium">Buzztate</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-t border-gray-800"><td className="p-3">Marketplace keywords</td><td className="p-3 text-center text-red-400">✗</td><td className="p-3 text-center text-gray-500">Varies</td><td className="p-3 text-center text-green-400">✓</td></tr>
                <tr className="border-t border-gray-800"><td className="p-3">Character limit compliance</td><td className="p-3 text-center text-red-400">✗</td><td className="p-3 text-center text-red-400">✗</td><td className="p-3 text-center text-green-400">✓</td></tr>
                <tr className="border-t border-gray-800"><td className="p-3">German compound nouns</td><td className="p-3 text-center text-red-400">✗</td><td className="p-3 text-center text-gray-500">Varies</td><td className="p-3 text-center text-green-400">✓</td></tr>
                <tr className="border-t border-gray-800"><td className="p-3">Flat file export</td><td className="p-3 text-center text-red-400">✗</td><td className="p-3 text-center text-red-400">✗</td><td className="p-3 text-center text-green-400">✓</td></tr>
                <tr className="border-t border-gray-800"><td className="p-3">Brand name protection</td><td className="p-3 text-center text-red-400">✗</td><td className="p-3 text-center text-gray-500">Varies</td><td className="p-3 text-center text-green-400">✓</td></tr>
                <tr className="border-t border-gray-800"><td className="p-3">Cost per listing</td><td className="p-3 text-center">Free</td><td className="p-3 text-center">$5-20+</td><td className="p-3 text-center text-yellow-400">From $0</td></tr>
              </tbody>
            </table>
          </div>
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

        {/* Related reading — internal cross-links */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Related Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/amazon-de-translation" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Market Guide</p>
              <p className="text-white font-medium text-sm">Localize Listings for Amazon Germany</p>
              <p className="text-gray-500 text-xs mt-1">Compound nouns, formal address, and Amazon.de search optimization</p>
            </Link>
            <Link href="/amazon-jp-translation" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Market Guide</p>
              <p className="text-white font-medium text-sm">Localize Listings for Amazon Japan</p>
              <p className="text-gray-500 text-xs mt-1">Keigo politeness, katakana brands, and Japanese search patterns</p>
            </Link>
            <Link href="/blog/localize-amazon-listings-germany" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Blog</p>
              <p className="text-white font-medium text-sm">How to Localize Amazon Listings for Germany</p>
              <p className="text-gray-500 text-xs mt-1">In-depth guide to the German marketplace</p>
            </Link>
            <Link href="/blog/amazon-seller-localization-tools-2026" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Blog</p>
              <p className="text-white font-medium text-sm">Amazon Seller Localization Tools Compared</p>
              <p className="text-gray-500 text-xs mt-1">The complete 2026 comparison of localization options</p>
            </Link>
          </div>
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

      <Footer />
    </div>
  );
}
