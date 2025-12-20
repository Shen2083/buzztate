import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, Loader2 } from "lucide-react";

export default function AuthPage() {
  // 1. Capture URL parameters
  const params = new URLSearchParams(window.location.search);
  const intent = params.get("intent"); // Check if user wants 'pro'

  const [isLogin, setIsLogin] = useState(() => {
    return params.get("mode") !== "signup"; // Returns false (Sign Up) if mode is signup
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to determine where to send the user
  const getRedirectUrl = () => {
    // If they came from "Get Pro", send them to dashboard with a checkout trigger
    if (intent === "pro") return "/app?action=checkout";
    // Otherwise, just go to the dashboard
    return "/app";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOG IN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // ✅ Redirect with intent preserved
        window.location.href = getRedirectUrl(); 
      } else {
        // --- SIGN UP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // CHECK: Did we get a session immediately?
        if (data.session) {
          // ✅ Redirect with intent preserved
          window.location.href = getRedirectUrl();
        } else {
          alert("Success! Please check your email for the confirmation link.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">

      {/* Brand Logo */}
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-yellow-400 p-3 rounded-full mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
          <Zap size={32} className="text-black" fill="black" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">Buzztate</h1>
        <p className="text-gray-500 mt-2">Localize the Vibe.</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex gap-4 mb-8 border-b border-gray-800 pb-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-3 text-sm font-bold transition-all ${
              isLogin ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-500 hover:text-white"
            }`}
          >
            LOG IN
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-3 text-sm font-bold transition-all ${
              !isLogin ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-500 hover:text-white"
            }`}
          >
            SIGN UP
          </button>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
            <input
              type="email"
              required
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-400 outline-none transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isLogin ? "ENTER DASHBOARD" : "CREATE ACCOUNT"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}