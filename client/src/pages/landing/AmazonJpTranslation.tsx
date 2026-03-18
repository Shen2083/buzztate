import { Link } from "wouter";
import { ArrowLeft, Check, ShoppingBag, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function AmazonJpTranslation() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* JSON-LD: WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Localize Listings for Amazon Japan",
            description: "Localize your listings for Amazon Japan with polite keigo language, detailed specifications, and Japanese search keyword optimization.",
            url: "https://buzztate.com/amazon-jp-translation",
            isPartOf: { "@type": "WebSite", name: "Buzztate", url: "https://buzztate.com" },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://buzztate.com/" },
                { "@type": "ListItem", position: 2, name: "Amazon Listing Localization", item: "https://buzztate.com/amazon-listing-translation" },
                { "@type": "ListItem", position: 3, name: "Amazon Japan", item: "https://buzztate.com/amazon-jp-translation" },
              ],
            },
          }),
        }}
      />

      {/* JSON-LD: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is keigo and why does it matter for Amazon Japan listings?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Keigo (敬語) is the Japanese politeness system. Product listings on Amazon.co.jp must use consistent formal keigo (ございます, いただけます, ご利用ください). Using casual language signals unprofessionalism and reduces conversion rates. Generic translation tools often produce inconsistent politeness levels.",
                },
              },
              {
                "@type": "Question",
                name: "How big is the Amazon Japan marketplace?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Amazon.co.jp is the fourth-largest Amazon marketplace globally with ¥3.5 trillion in annual GMV and over 52 million monthly active shoppers.",
                },
              },
              {
                "@type": "Question",
                name: "How should brand names be written in Japanese Amazon listings?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Foreign brand names must be rendered in katakana (e.g., Apple → アップル) while preserving the original English spelling for searchability. Buzztate handles this automatically for all brand names in your listings.",
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
          Translate Amazon Listings to <span className="text-yellow-400">Japanese for Amazon.co.jp</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Enter the Japanese market with listings that use keigo (polite language), katakana brand names, and the exhaustive product detail Japanese shoppers expect.
        </p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all flex items-center gap-2">
          Start Localizing for Amazon.co.jp <ArrowRight size={18} />
        </Link>
      </div>

      {/* What is Amazon Japan Localization — structured for AI extraction */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">What is Amazon Japan Listing Localization?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Amazon Japan (Amazon.co.jp) listing localization adapts product listings for Japanese shoppers on Amazon's fourth-largest global marketplace. It requires consistent keigo (敬語) politeness throughout, katakana rendering of foreign brand names, exhaustive product specifications, gift-giving context (贈り物), and mixed-script backend keywords (kanji + hiragana + katakana). Amazon.co.jp has ¥3.5T in annual GMV and 52M+ monthly shoppers.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Amazon Japan Is Unlike Any Other Marketplace</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Amazon.co.jp is the fourth-largest Amazon marketplace and one of the most lucrative — but it's also the most culturally distinct. Japanese shoppers expect a level of product detail that would seem excessive in Western markets. Where a US listing might have 5 bullet points, a successful Japanese listing needs exhaustive specifications, usage scenarios, and gift-giving context.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Japanese product copy uses keigo (敬語) — the formal politeness system built into the Japanese language. Using casual language in a product listing signals unprofessionalism to Japanese shoppers and tanks conversion rates. Generic translation tools often produce awkward mixes of politeness levels that immediately mark your listing as foreign.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Buzztate generates properly localized Japanese listings with consistent keigo, katakana rendering of brand names, Japanese measurement standards (centimeters, grams), and the detailed product descriptions that Japanese Amazon shoppers expect before purchasing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Japanese Amazon Listing Requirements</h2>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Keigo (Polite Language)</strong><span className="text-gray-400"> — All product descriptions use proper keigo: ございます, いただけます, ご利用ください. Buzztate maintains consistent politeness levels throughout the entire listing.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Katakana Brand Names</strong><span className="text-gray-400"> — Foreign brand names must be rendered in katakana (e.g., "Apple" → "アップル"). Buzztate handles this automatically while preserving the original English brand name for searchability.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Exhaustive Product Details</strong><span className="text-gray-400"> — Japanese shoppers expect detailed specifications, materials lists, dimensions, weight, included accessories, care instructions, and usage scenarios — all in the listing.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Gift Context (贈り物)</strong><span className="text-gray-400"> — Japan's gift-giving culture means many products are bought as gifts. Buzztate adds appropriate gift-related keywords and context: 誕生日プレゼント, 母の日ギフト, お歳暮.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Mixed Script Keywords</strong><span className="text-gray-400"> — Japanese search terms mix kanji, hiragana, and katakana. Buzztate generates backend keywords in all three scripts to maximize search coverage.</span></div></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">The Keigo Challenge</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 my-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-red-400 uppercase font-bold mb-3">Generic Translation</p>
                <p className="text-sm text-gray-400 mb-2">"このボトルは良い" (casual)</p>
                <p className="text-sm text-gray-400 mb-2">"あなたの犬が好きになる" (mixed levels)</p>
                <p className="text-xs text-red-400 mt-3">Inconsistent politeness = unprofessional</p>
              </div>
              <div>
                <p className="text-xs text-green-400 uppercase font-bold mb-3">Buzztate</p>
                <p className="text-sm text-white mb-2">"高品質なボトルでございます" (keigo)</p>
                <p className="text-sm text-white mb-2">"愛犬にお喜びいただけます" (consistent keigo)</p>
                <p className="text-xs text-green-400 mt-3">Consistent keigo = trusted by shoppers</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works for Amazon.co.jp</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 1:</strong> Export your Amazon listings from Seller Central as a flat file (CSV or tab-delimited).
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 2:</strong> Upload to Buzztate and select "Amazon Japan (.co.jp)" as your target marketplace.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 3:</strong> Buzztate generates keigo-compliant Japanese for every field — title, bullet points, description, and backend keywords — with katakana brand names and mixed-script search terms.
          </p>
          <p className="text-gray-400 leading-relaxed">
            <strong className="text-white">Step 4:</strong> Download the localized flat file and upload directly to Amazon Seller Central Japan. Your listings appear with professional, culturally appropriate Japanese copy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Amazon.co.jp Market Facts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400 mb-1">¥3.5T</p>
              <p className="text-xs text-gray-500">Annual GMV on Amazon.co.jp</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400 mb-1">52M+</p>
              <p className="text-xs text-gray-500">Monthly active shoppers</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400 mb-1">#4</p>
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
            <Link href="/amazon-de-translation" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Market Guide</p>
              <p className="text-white font-medium text-sm">Localize for Amazon Germany</p>
              <p className="text-gray-500 text-xs mt-1">Compound nouns, formal address, and more</p>
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
        <h2 className="text-3xl font-bold mb-4">Ready to Sell on Amazon Japan?</h2>
        <p className="text-gray-400 mb-8">Start with 5 free listing localizations. No credit card required.</p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all inline-flex items-center gap-2">
          Try Buzztate Free <ArrowRight size={18} />
        </Link>
      </div>

      <Footer />
    </div>
  );
}
