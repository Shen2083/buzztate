import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react"; // ✅ Added ArrowLeft

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Modes: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>("login");
  const [resetSent, setResetSent] = useState(false);
  const [, setLocation] = useLocation();

  // ✅ NEW: Read URL parameters to set initial mode (e.g. ?mode=signup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode");
    if (urlMode === "signup" || urlMode === "login") {
      setMode(urlMode);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setLocation("/app"); // Redirect to app on success
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email address.");

    setLoading(true);
    try {
      // ✅ Sends a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/app",
      });

      if (error) throw error;
      setResetSent(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">⚡</div>
          <h1 className="text-3xl font-extrabold mb-2">
            {mode === 'login' && "Welcome Back"}
            {mode === 'signup' && "Create Account"}
            {mode === 'forgot' && "Reset Password"}
          </h1>
          <p className="text-gray-400 text-sm">
            {mode === 'login' && "Enter your credentials to access your workspace."}
            {mode === 'signup' && "Get started with Buzztate today."}
            {mode === 'forgot' && "We'll send you a link to reset your password."}
          </p>
        </div>

        {/* ---------------- FORGOT PASSWORD VIEW ---------------- */}
        {mode === 'forgot' ? (
          resetSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Check your email</h3>
              <p className="text-gray-400 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <button 
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="text-yellow-400 font-bold hover:underline"
              >
                Back to Log In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-yellow-400 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
              </button>

              <div className="text-center mt-6">
                <button 
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-gray-500 hover:text-white transition-colors font-medium"
                >
                  <ArrowLeft className="inline mr-1" size={14} /> Back to Log In
                </button>
              </div>
            </form>
          )
        ) : (
          /* ---------------- LOGIN / SIGNUP VIEW ---------------- */
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-yellow-400 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                {/* ✅ FORGOT PASSWORD LINK */}
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-yellow-400 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black font-extrabold py-3.5 rounded-xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)] mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === "login" ? "Log In" : "Sign Up"} <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-4 text-center border-t border-gray-800 mt-6">
              <p className="text-sm text-gray-500">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-white font-bold hover:underline transition-all"
                >
                  {mode === "login" ? "Sign Up" : "Log In"}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}