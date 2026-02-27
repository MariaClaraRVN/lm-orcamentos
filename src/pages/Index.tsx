import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, History, FileText, Wrench, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Index() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-[hsl(var(--brand-black))] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img style={{ maxWidth: "150px", margin: "0 auto" }} src="/Icon.png" alt="Logo LM" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-sm text-gray-400 hidden sm:block">Sistema de Gestão</span>
            <Link to="/historico">
              <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-black">
                <History size={14} className="mr-1" />
                Orçamentos
              </Button>
            </Link>
            <Link to="/os/historico">
              <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-black">
                <ClipboardList size={14} className="mr-1" />
                Ordens de Serviço
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full space-y-8 text-center">
          <div>
            <img src="/LM_Manutencao.png" alt="LM Manutenções" className="mx-auto mb-6" style={{ maxWidth: "280px" }} />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sistema de Gestão</h1>
            <p className="text-muted-foreground text-sm">Geradores e Compressores — Orçamentos e Ordens de Serviço</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6">
                <Plus size={20} className="mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-lg">Escolha o tipo de registro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    setDialogOpen(false);
                    navigate("/orcamento/novo");
                  }}
                >
                  <FileText size={24} />
                  <span className="font-bold">Criar Orçamento</span>
                  <span className="text-xs opacity-70">Orçamento comercial de serviços</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    setDialogOpen(false);
                    navigate("/os/nova");
                  }}
                >
                  <Wrench size={24} />
                  <span className="font-bold">Criar Ordem de Serviço</span>
                  <span className="text-xs opacity-70">Retirada, diagnóstico e execução</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Quick access links */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Link to="/historico">
              <div className="border border-border rounded-lg p-4 hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer">
                <History size={20} className="mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium text-foreground">Histórico de Orçamentos</span>
              </div>
            </Link>
            <Link to="/os/historico">
              <div className="border border-border rounded-lg p-4 hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer">
                <ClipboardList size={20} className="mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium text-foreground">Histórico de OS</span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-xs text-center py-4">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
