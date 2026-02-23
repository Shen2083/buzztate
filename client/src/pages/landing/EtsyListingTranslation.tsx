import { Link } from "wouter";
import { ArrowLeft, Check, Globe, ArrowRight } from "lucide-react";

export default function EtsyListingTranslation() {
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
          <Globe size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 max-w-4xl leading-tight">
          Translate Etsy Listings That <span className="text-yellow-400">Actually Sell</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Reach international Etsy shoppers with localized listings that preserve your artisan voice and optimize for Etsy's tag-driven search.
        </p>
        <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-4 rounded-xl font-extrabold text-lg transition-all flex items-center gap-2">
          Start Localizing <ArrowRight size={18} />
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Etsy Listing Translation Is Different</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Etsy isn't Amazon. Etsy shoppers aren't searching for "stainless steel coffee maker" — they're searching for "handmade ceramic coffee mug" or "personalized wedding gift." Etsy's search algorithm is heavily tag-driven, and shoppers expect warm, personal descriptions that tell a story about your product and craft.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Generic translation tools strip away the artisan feel that makes Etsy listings convert. They produce clinical, robotic copy that feels out of place on a platform built around handmade goods and personal connection.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Buzztate understands Etsy. Our localization engine preserves the warm, personal tone your listings need while optimizing tags for international search. It generates 13 multi-word tags in the target language — not just translated single words, but actual phrases international shoppers use when browsing Etsy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">What Buzztate Does for Etsy Sellers</h2>
          <ul className="space-y-4">
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Tag Optimization</strong><span className="text-gray-400"> — Generates 13 tags per listing in the target language. Each tag is a multi-word phrase (not a single word) under 20 characters, optimized for Etsy's search algorithm.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Artisan Tone Preservation</strong><span className="text-gray-400"> — Your localized descriptions maintain the warm, personal, story-driven feel that Etsy shoppers expect. No clinical corporate-speak.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Title Under 140 Characters</strong><span className="text-gray-400"> — Etsy titles are limited to 140 characters. Buzztate enforces this limit and optimizes for search within the constraint.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Materials & Dimensions</strong><span className="text-gray-400"> — Automatically converts measurements to local standards and translates material descriptions, care instructions, and sizing information.</span></div></li>
            <li className="flex gap-3"><Check className="text-yellow-400 flex-shrink-0 mt-1" size={18} /><div><strong className="text-white">Etsy CSV Format</strong><span className="text-gray-400"> — Download a CSV matching Etsy's bulk edit format. Import directly through Etsy's listing manager.</span></div></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Supported Languages for Etsy</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Etsy's international presence spans Europe, Japan, and beyond. Buzztate supports German, French, Spanish, Italian, Japanese, Portuguese, Dutch, Polish, Swedish, Danish, Norwegian, and Finnish — covering all of Etsy's major international markets.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Each language localization is tailored for Etsy's audience. For example, German Etsy listings emphasize craftsmanship and quality materials ("handgefertigt," "nachhaltig"), while Japanese listings focus on the story behind the product and include gift-giving context that resonates with Japanese shoppers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">The Etsy Tag Challenge</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Etsy gives you 13 tags per listing, each limited to 20 characters. These tags are your primary discovery mechanism — they're more important than your title for search visibility. But translating English tags word-for-word rarely works:
          </p>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 my-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-red-400 uppercase font-bold mb-3">Literal Translation</p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>"handgemacht" (1 word)</li>
                  <li>"Geschenk" (1 word)</li>
                  <li>"Keramik" (1 word)</li>
                </ul>
                <p className="text-xs text-red-400 mt-3">Single words = low search match</p>
              </div>
              <div>
                <p className="text-xs text-green-400 uppercase font-bold mb-3">Buzztate Tags</p>
                <ul className="space-y-1 text-sm text-white">
                  <li>"handgemachte Tasse"</li>
                  <li>"Geschenk für sie"</li>
                  <li>"Keramik Kaffeebecher"</li>
                </ul>
                <p className="text-xs text-green-400 mt-3">Multi-word phrases = high search match</p>
              </div>
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Buzztate generates multi-word tag phrases that match how international shoppers actually search on Etsy, dramatically improving your listing's discoverability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 1:</strong> Go to your Etsy Shop Manager and download your listings as a CSV using the "Download Data" option in the Listings tab.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 2:</strong> Upload the CSV to Buzztate. We auto-detect Etsy's Title, Description, and Tags columns.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            <strong className="text-white">Step 3:</strong> Select "Etsy (International)" as your marketplace and choose your target language. Buzztate localizes every listing with tag optimization and artisan tone.
          </p>
          <p className="text-gray-400 leading-relaxed">
            <strong className="text-white">Step 4:</strong> Download the Etsy-format CSV and use it to create or update your localized listings in Etsy's listing manager.
          </p>
        </section>
      </div>

      {/* CTA */}
      <div className="py-20 text-center bg-gray-900/20 border-t border-gray-800">
        <h2 className="text-3xl font-bold mb-4">Ready to Reach International Etsy Shoppers?</h2>
        <p className="text-gray-400 mb-8">Start with 5 free listing localizations. No credit card required.</p>
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
