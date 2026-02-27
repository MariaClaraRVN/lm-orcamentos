import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OrcamentoNovo from "./pages/OrcamentoNovo";
import Historico from "./pages/Historico";
import OrcamentoView from "./pages/OrcamentoView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/orcamento/novo" element={<OrcamentoNovo />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/orcamento/:id" element={<OrcamentoView />} />
          <Route path="/os/nova" element={<NotFound />} />
          <Route path="/os/historico" element={<NotFound />} />
          <Route path="/os/:id" element={<NotFound />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
