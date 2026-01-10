import { Link } from "wouter";
import { ArrowLeft, Globe, Star, Check } from "lucide-react";

export default function LanguageLanding({ lang }: { lang: string }) {
  // Capitalize first letter for display (e.g., "spanish" -> "Spanish")
  const languageName = lang.charAt(0).toUpperCase() + lang.slice(1);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">

      {/* Simple Nav */}
      <nav className="p-6 border-b border-gray-800 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <Link href="/auth?mode=signup" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold text-sm">
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mb-8">
          <Globe size={32} className="text-yellow-400" />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 max-w-4xl">
          The Best AI <span className="text-yellow-400">{languageName}</span> Translator.
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          Don't just translate words. Adapt your content into {languageName} Slang, Corporate Speak, or Marketing Copy instantly with Buzztate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/auth?mode=signup" className="flex-1 bg-white text-black px-8 py-4 rounded-xl font-bold text-center hover:bg-gray-200 transition-colors">
            Translate {languageName} Now
          </Link>
        </div>
      </div>

      {/* SEO Content Grid */}
      <div className="bg-gray-900/30 py-20 border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">

          <div>
            <h3 className="text-2xl font-bold mb-4">Why Buzztate for {languageName}?</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Most translators struggle with {languageName} idioms and cultural nuance. 
              Our "Vibe Engine" is specifically trained to detect context, ensuring you don't sound like a robot when talking to {languageName} speakers.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-gray-300">
                <Check className="text-yellow-400" /> <span>Native {languageName} Dialects</span>
              </li>
              <li className="flex gap-3 text-gray-300">
                <Check className="text-yellow-400" /> <span>Formal vs. Informal Detection</span>
              </li>
              <li className="flex gap-3 text-gray-300">
                <Check className="text-yellow-400" /> <span>Slang & Social Media Ready</span>
              </li>
            </ul>
          </div>

          <div className="bg-black border border-gray-800 p-8 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">
                Example
             </div>
             <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">English Input</p>
                  <p className="text-lg italic">"That is awesome!"</p>
                </div>
                <div className="h-px bg-gray-800 w-full"></div>
                <div>
                  <p className="text-xs text-yellow-400 uppercase font-bold mb-1">{languageName} Output (Slang)</p>
                  <p className="text-lg font-bold">
                    {/* Simple conditional logic for demo purposes */}
                    {lang === 'spanish' ? "¡Eso está brutal! 🔥" : 
                     lang === 'french' ? "C'est trop stylé ! ✨" : 
                     lang === 'german' ? "Das ist der Hammer! 🍺" : 
                     lang === 'japanese' ? "めっちゃ最高！ 🎎" : 
                     "Native-level translation generated..."}
                  </p>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-8">Ready to go global?</h2>
        <Link href="/auth?mode=signup" className="text-yellow-400 hover:text-white underline underline-offset-4 text-lg">
          Start translating to {languageName} for free &rarr;
        </Link>
      </div>

    </div>
  );
}