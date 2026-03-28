import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Index from "./pages/Index";
import OrcamentoNovo from "./pages/OrcamentoNovo";
import Historico from "./pages/Historico";
import OrcamentoView from "./pages/OrcamentoView";
import OrdemServicoNova from "./pages/OrdemServicoNova";
import OrdensServicoHistorico from "./pages/OrdensServicoHistorico";
import OrdemServicoView from "./pages/OrdemServicoView";
import ContratoNovo from "./pages/ContratoNovo";
import ContratosHistorico from "./pages/ContratosHistorico";
import ContratoView from "./pages/ContratoView";
import ChecklistNovo from "./pages/ChecklistNovo";
import ChecklistView from "./pages/ChecklistView";
import ChecklistsHistorico from "./pages/ChecklistsHistorico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/orcamento/novo" element={<ProtectedRoute><OrcamentoNovo /></ProtectedRoute>} />
      <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
      <Route path="/orcamento/:id" element={<ProtectedRoute><OrcamentoView /></ProtectedRoute>} />
      <Route path="/os/nova" element={<ProtectedRoute><OrdemServicoNova /></ProtectedRoute>} />
      <Route path="/os/historico" element={<ProtectedRoute><OrdensServicoHistorico /></ProtectedRoute>} />
      <Route path="/os/:id" element={<ProtectedRoute><OrdemServicoView /></ProtectedRoute>} />
      <Route path="/contrato/novo" element={<ProtectedRoute><ContratoNovo /></ProtectedRoute>} />
      <Route path="/contratos/historico" element={<ProtectedRoute><ContratosHistorico /></ProtectedRoute>} />
      <Route path="/contrato/:id" element={<ProtectedRoute><ContratoView /></ProtectedRoute>} />
      <Route path="/checklist/novo" element={<ProtectedRoute><ChecklistNovo /></ProtectedRoute>} />
      <Route path="/checklist/:id" element={<ProtectedRoute><ChecklistView /></ProtectedRoute>} />
      <Route path="/checklists/historico" element={<ProtectedRoute><ChecklistsHistorico /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
