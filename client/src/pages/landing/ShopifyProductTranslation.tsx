import { Link } from "wouter";
import { ArrowLeft, Check, Store, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

export default function ShopifyProductTranslation() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* JSON-LD: WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Shopify Product Localization for Sellers",
            description: "Convert Shopify products into marketplace-ready Amazon or Etsy listings. Buzztate maps fields, generates missing content, and localizes for each market.",
            url: "https://buzztate.com/shopify-product-translation",
            isPartOf: { "@type": "WebSite", name: "Buzztate", url: "https://buzztate.com" },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://buzztate.com/" },
                { "@type": "ListItem", position: 2, name: "Shopify Product Localization", item: "https://buzztate.com/shopify-product-translation" },
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
            name: "How to Localize Shopify Products for International Markets",
            description: "Translate and localize your Shopify product catalog for global sales in 4 steps using Buzztate.",
            step: [
              { "@type": "HowToStep", position: 1, name: "Export from Shopify", text: "Go to your Shopify admin, navigate to Products, and click Export to download your product catalog as a CSV file." },
              { "@type": "HowToStep", position: 2, name: "Upload to Buzztate", text: "Upload the CSV to Buzztate. Shopify columns (Title, Body HTML, Tags) are auto-detected and mapped." },
              { "@type": "HowToStep", position: 3, name: "Select target language", text: "Select Shopify (Multi-market) as your target and choose your target language. Buzztate generates Google SEO-optimized translations." },
              { "@type": "HowToStep", position: 4, name: "Download and import", text: "Download the Shopify-format CSV and import it back through Shopify's bulk product editor." },
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

      {/* What is Shopify Product Localization — structured for AI extraction */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">What is Shopify Product Localization?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Shopify product localization is the process of translating and adapting your Shopify product catalog for international markets. Unlike Amazon, Shopify product discovery is Google-driven, so localized products need Google SEO-optimized titles, meta descriptions, and HTML body content in each target language. Buzztate generates all of this from a standard Shopify CSV export.
          </p>
        </div>
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

        {/* Related reading — internal cross-links */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Related Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/amazon-listing-translation" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Platform Guide</p>
              <p className="text-white font-medium text-sm">Amazon Listing Localization</p>
              <p className="text-gray-500 text-xs mt-1">Localize for Amazon's international marketplaces</p>
            </Link>
            <Link href="/etsy-listing-translation" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Platform Guide</p>
              <p className="text-white font-medium text-sm">Etsy Listing Localization</p>
              <p className="text-gray-500 text-xs mt-1">Tag-optimized translations for Etsy's international markets</p>
            </Link>
            <Link href="/blog/amazon-seller-localization-tools-2026" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Blog</p>
              <p className="text-white font-medium text-sm">Amazon Seller Localization Tools Compared</p>
              <p className="text-gray-500 text-xs mt-1">The complete 2026 comparison of localization options</p>
            </Link>
            <Link href="/blog/why-keyword-research-not-enough-localize-amazon-listings" className="block bg-gray-900/50 border border-gray-800 hover:border-gray-600 rounded-xl p-4 transition-colors">
              <p className="text-xs text-yellow-400 uppercase font-bold mb-1">Blog</p>
              <p className="text-white font-medium text-sm">Why Keyword Research Isn't Enough</p>
              <p className="text-gray-500 text-xs mt-1">What marketplace localization really requires</p>
            </Link>
          </div>
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

      <Footer />
    </div>
  );
}
