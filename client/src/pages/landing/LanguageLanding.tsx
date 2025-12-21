import { Link, useRoute } from "wouter";
import { Check, Zap, Globe, ArrowRight } from "lucide-react";
import { useEffect } from "react";

// Helper to capitalize "spanish" -> "Spanish"
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function LanguageLanding(props: { lang?: string }) {
  // If passed via props or URL params
  const language = props.lang ? capitalize(props.lang) : "Multiple Languages";

  // ⚡ SEO MAGIC: Update the Page Title dynamically for Google
  useEffect(() => {
    document.title = `Translate English to ${language} with Gen Z Slang & Corporate Vibe - Buzztate`;

    // Update Meta Description (Optional but recommended)
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `Instantly translate text into ${language} while keeping the vibe. Convert to Gen Z slang, Corporate speak, or Marketing copy in ${language}.`);
    }
  }, [language]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Navbar (Simplified) */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-3xl">⚡</span>
            <span className="font-bold text-xl tracking-tight">Buzztate</span>
          </Link>
          <Link href="/auth?mode=signup" className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2 rounded-full font-bold text-sm transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Dynamic Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6 pt-20 pb-20">
        <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 font-bold text-xs uppercase tracking-wide mb-8">
           AI {language} Translator
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-5xl">
          Translate English to <span className="text-yellow-400">{language}</span>.<br />
          <span className="text-gray-500 text-4xl md:text-6xl">Keep the Vibe.</span>
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Don't sound like a robot in {language}. Use Buzztate to translate your content into 
          <strong> {language} Gen Z Slang</strong>, <strong>Corporate Speak</strong>, or <strong>Marketing Copy</strong> instantly.
        </p>

        {/* Call to Action */}
        <Link 
          href="/auth?mode=signup" 
          className="px-10 py-5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-lg transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] flex items-center gap-2"
        >
          Translate to {language} Now <ArrowRight size={20} />
        </Link>
      </div>

      {/* "Why Us" Grid */}
      <div className="bg-gray-900/20 py-20 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 bg-black border border-gray-800 rounded-2xl">
              <Globe className="text-yellow-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Native {language} Nuance</h3>
              <p className="text-gray-400">Our AI understands cultural references in {language} that Google Translate misses.</p>
           </div>
           <div className="p-8 bg-black border border-gray-800 rounded-2xl">
              <Zap className="text-yellow-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Instant Speed</h3>
              <p className="text-gray-400">Generate {language} marketing copy or emails in seconds.</p>
           </div>
           <div className="p-8 bg-black border border-gray-800 rounded-2xl">
              <Check className="text-yellow-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Professional Accuracy</h3>
              <p className="text-gray-400">Used by professionals to localize content for the {language}-speaking market.</p>
           </div>
        </div>
      </div>

      {/* Footer Link Back */}
      <footer className="py-10 text-center text-gray-600 text-sm">
        <Link href="/" className="hover:text-yellow-400 underline">Back to Home</Link>
      </footer>
    </div>
  );
}