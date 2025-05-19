
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
