import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Import Pages
import Home from "@/pages/home";
import Landing from "@/pages/landing"; 
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* The Landing Page is now the root */}
      <Route path="/" component={Landing} />
      
      {/* The actual tool lives at /app */}
      <Route path="/app" component={Home} />
      
      {/* 404 Handler */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
