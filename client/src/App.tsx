import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/store";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import UniversityPage from "@/pages/university";
import UberPage from "@/pages/uber";
import SettingsPage from "@/pages/settings";
import HealthPage from "@/pages/health";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/university" component={UniversityPage} />
        <Route path="/uber" component={UberPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/health" component={HealthPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
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
