
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SurveyResponse from "./pages/SurveyResponse";
import Templates from "./pages/Templates";
import Questions from "./pages/Questions";
import Reports from "./pages/Reports";
import Employees from "./pages/Employees";
import SurveyDetails from "./pages/SurveyDetails";
import TemplateDetails from "./pages/TemplateDetails";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";

/**
 * Configure React Query client with default options
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/**
 * Main application component that sets up providers and routing
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/survey/:id" element={<SurveyResponse />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="surveys/:id" element={<SurveyDetails />} />
              <Route path="templates" element={<Templates />} />
              <Route path="templates/:id" element={<TemplateDetails />} />
              <Route path="questions" element={<Questions />} />
              <Route path="reports" element={<Reports />} />
              <Route path="employees" element={<Employees />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
