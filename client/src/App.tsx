import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase"; // Import our new connection

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth"; // We will create this next

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
      if (session && location === "/auth") setLocation("/app");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Switch>
      <Route path="/" component={Landing} />

      {/* The Login/Signup Page */}
      <Route path="/auth" component={AuthPage} />

      {/* Protected App Route */}
      <Route path="/app">
        {session ? <Home session={session} /> : <AuthPage />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}
import LanguageLanding from "@/pages/landing/LanguageLanding";

// ... inside your <Switch> or <Router> ...

{/* Dynamic Route: Matches /translate/spanish, /translate/french, etc. */}
<Route path="/translate/:lang">
  {(params) => <LanguageLanding lang={params.lang} />}
</Route>
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}