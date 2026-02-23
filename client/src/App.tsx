import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import LanguageLanding from "@/pages/landing/LanguageLanding";
import AmazonListingTranslation from "@/pages/landing/AmazonListingTranslation";
import ShopifyProductTranslation from "@/pages/landing/ShopifyProductTranslation";
import EtsyListingTranslation from "@/pages/landing/EtsyListingTranslation";
import AmazonDeTranslation from "@/pages/landing/AmazonDeTranslation";
import AmazonJpTranslation from "@/pages/landing/AmazonJpTranslation";

function Router() {
  const [session, setSession] = useState<any>(null);
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(true); // Added loading state to prevent flash

  // 1. Handle Auth Session & Subscriptions
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Handle Redirects (Separated for stability)
  useEffect(() => {
    if (!loading && session && location === "/auth") {
      setLocation("/app"); // Kick logged-in users out of Auth page
    }
  }, [session, location, loading, setLocation]);

  if (loading) return null; // Or a loading spinner

  return (
    <Switch>
      {/* Public Landing Page */}
      <Route path="/" component={Landing} />

      {/* Login/Signup Page */}
      <Route path="/auth" component={AuthPage} />

      {/* Marketplace SEO Pages */}
      <Route path="/amazon-listing-translation" component={AmazonListingTranslation} />
      <Route path="/shopify-product-translation" component={ShopifyProductTranslation} />
      <Route path="/etsy-listing-translation" component={EtsyListingTranslation} />
      <Route path="/amazon-de-translation" component={AmazonDeTranslation} />
      <Route path="/amazon-jp-translation" component={AmazonJpTranslation} />

      {/* Dynamic SEO Pages for Languages (e.g. /translate/spanish) */}
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}