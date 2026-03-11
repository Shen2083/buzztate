import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { trackSignUp } from "@/lib/gtag";
import { Loader2, Mail, Lock, ArrowRight, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

/** Map common Supabase error messages to user-friendly text */
function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Invalid email or password. Please try again.";
  if (lower.includes("email not confirmed")) return "Please check your email to confirm your account before logging in.";
  if (lower.includes("user already registered")) return "An account with this email already exists. Try logging in instead.";
  if (lower.includes("password should be at least")) return "Password must be at least 6 characters.";
  if (lower.includes("email rate limit")) return "Too many attempts. Please wait a minute and try again.";
  if (lower.includes("signup is disabled")) return "Signups are currently disabled. Please try again later.";
  if (lower.includes("network") || lower.includes("fetch")) return "We're having trouble connecting. Please check your internet and try again.";
  return message;
}

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Modes: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>("login");
  const [resetSent, setResetSent] = useState(false);
  const [, setLocation] = useLocation();

  // Read URL parameters to set initial mode (e.g. ?mode=signup)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get("mode");
    if (urlMode === "signup" || urlMode === "login") {
      setMode(urlMode);
    }
  }, []);

  // Clear error when mode changes
  useEffect(() => {
    setError(null);
    setSignupSuccess(false);
  }, [mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setLocation("/app");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        trackSignUp();
        setSignupSuccess(true);
      }
    } catch (error: any) {
      setError(friendlyAuthError(error.message || "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/app",
      });

      if (error) throw error;
      setResetSent(true);
    } catch (error: any) {
      setError(friendlyAuthError(error.message || "Could not send reset email. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-grow flex items-center justify-center w-full">
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

        {/* Inline error message */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 text-red-300 text-sm bg-red-400/5 border border-red-400/20 rounded-xl p-3">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ---------------- SIGNUP SUCCESS VIEW ---------------- */}
        {signupSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Check your email</h3>
            <p className="text-gray-400 text-sm mb-6">
              We've sent a confirmation link to <strong>{email}</strong>. Please confirm your email to get started.
            </p>
            <button
              onClick={() => { setMode('login'); setSignupSuccess(false); }}
              className="text-yellow-400 font-bold hover:underline"
            >
              Back to Log In
            </button>
          </div>
        ) : mode === 'forgot' ? (
          /* ---------------- FORGOT PASSWORD VIEW ---------------- */
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
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
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
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
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
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black font-extrabold py-3.5 rounded-xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)] mt-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === "login" ? "Log In" : "Sign Up"} <ArrowRight size={18} />
                </>
              )}
            </button>

            {mode === "signup" && (
              <p className="text-xs text-gray-500 text-center mt-3">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-yellow-400 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-yellow-400 hover:underline">Privacy Policy</Link>.
              </p>
            )}

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

      <Footer minimal />
    </div>
  );
}
