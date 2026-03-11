import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/lib/supabase";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NetworkStatus from "@/components/NetworkStatus";

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
import PrivacyPolicy from "@/pages/landing/PrivacyPolicy";
import TermsOfService from "@/pages/landing/TermsOfService";

/**
 * Auth-gated wrapper — only used for /app route.
 * Renders children when session is resolved, shows auth page if not logged in.
 */
function ProtectedRoute() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hard cap: never block for more than 2 seconds
    const timeout = setTimeout(() => setLoading(false), 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setSession(session);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#000" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #333", borderTopColor: "#facc15", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          <p style={{ color: "#666", marginTop: 16, fontFamily: "system-ui", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return session ? <Home session={session} /> : <AuthPage />;
}

function Router() {
  const [location, setLocation] = useLocation();

  // Redirect /auth to /app if user navigates there directly while logged in
  useEffect(() => {
    if (location === "/auth") {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setLocation("/app");
      }).catch(() => {});
    }
  }, [location, setLocation]);

  return (
    <Switch>
      {/* Public pages — render instantly, no auth check */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/amazon-listing-translation" component={AmazonListingTranslation} />
      <Route path="/shopify-product-translation" component={ShopifyProductTranslation} />
      <Route path="/etsy-listing-translation" component={EtsyListingTranslation} />
      <Route path="/amazon-de-translation" component={AmazonDeTranslation} />
      <Route path="/amazon-jp-translation" component={AmazonJpTranslation} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/translate/:lang">
        {(params) => <LanguageLanding lang={params.lang} />}
      </Route>

      {/* Protected app — only this route waits for auth */}
      <Route path="/app" component={ProtectedRoute} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NetworkStatus />
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
