import { Link } from "wouter";
import { ArrowLeft, Check, ShoppingBag, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function AmazonDeTranslation() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* JSON-LD: WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Localize Listings for Amazon Germany",
            description: "Localize your listings for Amazon Germany with German compound search terms, marketplace-compliant bullet points, and cultural adaptation.",
            url: "https://buzztate.com/amazon-de-translation",
            isPartOf: { "@type": "WebSite", name: "Buzztate", url: "https://buzztate.com" },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://buzztate.com/" },
                { "@type": "ListItem", position: 2, name: "Amazon Listing Localization", item: "https://buzztate.com/amazon-listing-translation" },
                { "@type": "ListItem", position: 3, name: "Amazon Germany", item: "https://buzztate.com/amazon-de-translation" },
              ],
            },
          }),
        }}
      />

      {/* JSON-LD: FAQPage for compound noun questions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Why are German compound nouns important for Amazon.de listings?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "German uses compound nouns where English uses multiple words. 'Coffee machine' becomes 'Kaffeemaschine' — one word. If your listing splits it into 'Kaffee Maschine' (two words), Amazon's A9 algorithm won't match it to German shoppers' searches, making your product invisible in search results.",
                },
              },
              {
                "@type": "Question",
                name: "How big is the Amazon Germany marketplace?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Amazon.de is Amazon's second-largest marketplace globally with €37.4 billion in annual GMV and over 44 million monthly active shoppers.",
                },
              },
              {
                "@type": "Question",
                name: "Should I use 'du' or 'Sie' in German Amazon listings?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Always use the formal 'Sie' form in German Amazon listings. Using the informal 'du' signals unprofessionalism to German shoppers. 'You'll love this product' should be translated as 'Sie werden dieses Produkt lieben,' never 'Du wirst dieses Produkt lieben.'",
                },
              },
            ],
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
          Translate Amazon Listings to <span className="text-yellow-400">German for Amazon.de</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Expand to Amazon Germany with properly localized listings that understand German compound nouns, formal address, and Amazon.de search behavior.
        </p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all flex items-center gap-2">
          Start Localizing for Amazon.de <ArrowRight size={18} />
        </Link>
      </div>

      {/* What is Amazon Germany Localization — structured for AI extraction */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">What is Amazon Germany Listing Localization?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Amazon Germany (Amazon.de) listing localization adapts your product listings for German-speaking shoppers on Amazon's second-largest global marketplace. It goes beyond translation to include German compound nouns (Kaffeemaschine, not Kaffee Maschine), formal "Sie" address, metric unit conversion, €-format number formatting (€1.299,99), and backend keyword optimization with umlauts (ä, ö, ü). Amazon.de has €37.4B in annual GMV and 44M+ monthly shoppers.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Amazon Germany Requires Specialized Translation</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Amazon.de is Amazon's second-largest market outside the US, and German shoppers have distinctly different search habits. The most critical difference: German uses compound nouns. A "coffee machine" in English becomes "Kaffeemaschine" — one word. If your translation splits it into "Kaffee Maschine" (two words), Amazon's A9 algorithm won't match it to German shoppers' searches.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Beyond compound nouns, German Amazon listings require formal "Sie" address (not the informal "du"), metric measurements (centimeters, kilograms, Celsius), and CE/TÜV certification mentions that German shoppers actively look for. Generic translation tools miss all of this.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Buzztate is built specifically for Amazon sellers expanding to Germany. It generates compound nouns correctly, uses formal address, converts measurements, and optimizes your backend keywords for German search patterns.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">German Amazon Listing Challenges</h2>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Compound Nouns</strong><span className="text-gray-400"> — "Stainless steel water bottle" → "Edelstahl-Trinkflasche" (not "Edelstahl Wasser Flasche"). Buzztate generates correct German compound words that match search queries.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Formal Address (Sie)</strong><span className="text-gray-400"> — German Amazon expects formal tone. "You'll love this product" becomes "Sie werden dieses Produkt lieben" — never the informal "du" form.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Metric Conversion</strong><span className="text-gray-400"> — Inches to centimeters, ounces to milliliters, Fahrenheit to Celsius. All measurements are automatically converted to what German shoppers expect.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Backend Keywords</strong><span className="text-gray-400"> — Amazon.de backend search terms need German-specific keywords including umlauts (ä, ö, ü), compound words, and common misspellings German shoppers make.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Number Formatting</strong><span className="text-gray-400"> — Germany uses comma for decimal and period for thousands: €1.299,99 not $1,299.99. Buzztate handles all number formatting correctly.</span></div></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Compound Noun Example</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 my-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-red-400 uppercase font-bold mb-3">Google Translate</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>"Edelstahl Wasser Flasche"</li>
                  <li>"Kaffee Maschine mit Milch Aufschäumer"</li>
                  <li>"Hunde Spielzeug für große Hunde"</li>
                </ul>
                <p className="text-xs text-red-400 mt-3">Split words = invisible in German search</p>
              </div>
              <div>
                <p className="text-xs text-green-400 uppercase font-bold mb-3">Buzztate</p>
                <ul className="space-y-2 text-sm text-white">
                  <li>"Edelstahl-Trinkflasche"</li>
                  <li>"Kaffeemaschine mit Milchaufschäumer"</li>
                  <li>"Hundespielzeug für große Hunde"</li>
                </ul>
                <p className="text-xs text-green-400 mt-3">Correct compounds = found by shoppers</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works for Amazon.de</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 1:</strong> Export your Amazon.com listings from Seller Central as a flat file. You can export individual products or your entire catalog.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 2:</strong> Upload the file to Buzztate and select "Amazon Germany (.de)" as your target marketplace.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 3:</strong> Buzztate localizes every field — title, bullet points, description, and backend keywords — using German compound nouns, formal address, and Amazon.de search optimization.
          </p>
          <p className="text-gray-400 leading-relaxed">
            <strong className="text-white">Step 4:</strong> Download the localized flat file and upload it to Amazon Seller Central Europe. Your German listings go live immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Amazon.de Market Facts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400 mb-1">€37.4B</p>
              <p className="text-xs text-gray-500">Annual GMV on Amazon.de</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400 mb-1">44M+</p>
              <p className="text-xs text-gray-500">Monthly active shoppers</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400 mb-1">#2</p>
              <p className="text-xs text-gray-500">Largest Amazon marketplace globally</p>
            </div>
          </div>
        </section>

        {/* Related reading — internal cross-links */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Related Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/amazon-listing-translation" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Platform Guide</p>
              <p className="text-white font-medium text-sm">Amazon Listing Localization</p>
              <p className="text-gray-500 text-xs mt-1">All Amazon international marketplaces</p>
            </Link>
            <Link href="/amazon-jp-translation" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Market Guide</p>
              <p className="text-white font-medium text-sm">Localize for Amazon Japan</p>
              <p className="text-gray-500 text-xs mt-1">Keigo, katakana, and Japanese search patterns</p>
            </Link>
            <Link href="/blog/localize-amazon-listings-germany" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Blog</p>
              <p className="text-white font-medium text-sm">How to Localize Amazon Listings for Germany</p>
              <p className="text-gray-500 text-xs mt-1">In-depth guide to the German marketplace</p>
            </Link>
            <Link href="/blog/amazon-seller-localization-tools-2026" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Blog</p>
              <p className="text-white font-medium text-sm">Amazon Seller Localization Tools Compared</p>
              <p className="text-gray-500 text-xs mt-1">The complete 2026 comparison</p>
            </Link>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="py-20 text-center bg-gray-900/20 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">Ready to Sell on Amazon Germany?</h2>
        <p className="text-gray-400 mb-8">Start with 5 free listing localizations. No credit card required.</p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all inline-flex items-center gap-2">
          Try Buzztate Free <ArrowRight size={18} />
        </Link>
      </div>

      <Footer />
    </div>
  );
}
