import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/store";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import AcademicDashboard from "@/pages/academic-dashboard";
import UberPage from "@/pages/uber";
import SettingsPage from "@/pages/settings";
import HealthPage from "@/pages/health";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/academic" component={AcademicDashboard} />
        <Route path="/uber" component={UberPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/health" component={HealthPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    // Initialize theme on app load
    const isDarkMode = localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
