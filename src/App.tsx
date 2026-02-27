import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OrcamentoNovo from "./pages/OrcamentoNovo";
import Historico from "./pages/Historico";
import OrcamentoView from "./pages/OrcamentoView";
import OrdemServicoNova from "./pages/OrdemServicoNova";
import OrdensServicoHistorico from "./pages/OrdensServicoHistorico";
import OrdemServicoView from "./pages/OrdemServicoView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
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
          <Route path="/os/nova" element={<OrdemServicoNova />} />
          <Route path="/os/historico" element={<OrdensServicoHistorico />} />
          <Route path="/os/:id" element={<OrdemServicoView />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
}

export default App;
