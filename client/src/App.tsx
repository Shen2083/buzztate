import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";

// Pages
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import LanguageLanding from "@/pages/landing/LanguageLanding"; // 👈 New Import

function Router() {
  const [session, setSession] = useState<any>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for changes (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Redirect to app if logged in, or landing if logged out
      // (Optional: You can remove the location check if you want purely protected routes)
      if (session && location === "/auth") setLocation("/app");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Switch>
      {/* Public Landing Page */}
      <Route path="/" component={Landing} />

      {/* Login/Signup Page */}
      <Route path="/auth" component={AuthPage} />

      {/* 👇 NEW: Dynamic SEO Pages for Languages (e.g. /translate/spanish) */}
      <Route path="/translate/:lang">
        {(params) => <LanguageLanding lang={params.lang} />}
      </Route>

      {/* Protected App Route */}
      <Route path="/app">
        {session ? <Home session={session} /> : <AuthPage />}
      </Route>

      {/* 404 Page */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}