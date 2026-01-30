import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudyProvider } from "@/lib/studyContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Topics from "./pages/Topics";
import MockTest from "./pages/MockTest";
import QuestionPaper from "./pages/QuestionPaper";
import Performance from "./pages/Performance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StudyProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/mock-test" element={<MockTest />} />
            <Route path="/question-paper" element={<QuestionPaper />} />
            <Route path="/performance" element={<Performance />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </StudyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
