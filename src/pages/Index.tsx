import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, History, FileText, Wrench, ClipboardList, ScrollText, ClipboardCheck, LogOut, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
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
  const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const { signOut } = useAuth();

  const trocarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) return toast({ title: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
    if (novaSenha !== confirmSenha) return toast({ title: "As senhas não coincidem", variant: "destructive" });
    setSalvandoSenha(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      toast({ title: "Erro ao trocar senha", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha alterada com sucesso!" });
      setSenhaDialogOpen(false);
      setNovaSenha("");
      setConfirmSenha("");
    }
    setSalvandoSenha(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-[hsl(var(--brand-black))] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="shrink-0">
            <img className="h-10 sm:h-12 w-auto" src="/Icon.png" alt="Logo LM" />
          </Link>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs text-gray-400 hidden sm:block">Sistema de Gestão</span>
            <Button variant="ghost" size="sm" onClick={() => setSenhaDialogOpen(true)} className="text-gray-400 hover:text-white hover:bg-transparent text-xs px-1" title="Trocar senha">
              <KeyRound size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-400 hover:text-white hover:bg-transparent text-xs px-1" title="Sair">
              <LogOut size={14} />
            </Button>
            <Link to="/historico">
              <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-[hsl(var(--brand-black))] text-xs px-2 sm:px-3">
                <History size={14} className="mr-1" />
                <span className="hidden sm:inline">Orçamentos</span>
                <span className="sm:hidden">Orç.</span>
              </Button>
            </Link>
            <Link to="/os/historico">
              <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-[hsl(var(--brand-black))] text-xs px-2 sm:px-3">
                <ClipboardList size={14} className="mr-1" />
                <span className="hidden sm:inline">Ordens de Serviço</span>
                <span className="sm:hidden">OS</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-3 py-8">
        <div className="max-w-lg w-full space-y-6 text-center">
          <div>
            <img src="/LM_Manutencao.png" alt="LM Manutenções" className="mx-auto mb-4" style={{ maxWidth: "240px", width: "100%" }} />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Sistema de Gestão</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Geradores e Compressores — Orçamentos e Ordens de Serviço</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base px-6 py-5 sm:px-8 sm:py-6 w-full sm:w-auto">
                <Plus size={18} className="mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md mx-3">
              <DialogHeader>
                <DialogTitle className="text-center text-base sm:text-lg">Escolha o tipo de registro</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-3">
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => { setDialogOpen(false); navigate("/orcamento/novo"); }}
                >
                  <FileText size={22} />
                  <span className="font-bold text-sm">Criar Orçamento</span>
                  <span className="text-[10px] sm:text-xs opacity-70">Orçamento comercial de serviços</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => { setDialogOpen(false); navigate("/os/nova"); }}
                >
                  <Wrench size={22} />
                  <span className="font-bold text-sm">Criar Ordem de Serviço</span>
                  <span className="text-[10px] sm:text-xs opacity-70">Retirada, diagnóstico e execução</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => { setDialogOpen(false); navigate("/contrato/novo"); }}
                >
                  <ScrollText size={22} />
                  <span className="font-bold text-sm">Criar Contrato</span>
                  <span className="text-[10px] sm:text-xs opacity-70">Manutenção preventiva de gerador</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex flex-col gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => { setDialogOpen(false); navigate("/checklist/novo"); }}
                >
                  <ClipboardCheck size={22} />
                  <span className="font-bold text-sm">Criar Checklist</span>
                  <span className="text-[10px] sm:text-xs opacity-70">Verificação de manutenção preventiva</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Link to="/historico">
              <div className="border border-border rounded-lg p-3 sm:p-4 hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer">
                <History size={18} className="mx-auto mb-2 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Orçamentos</span>
              </div>
            </Link>
            <Link to="/os/historico">
              <div className="border border-border rounded-lg p-3 sm:p-4 hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer">
                <ClipboardList size={18} className="mx-auto mb-2 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Ordens de Serviço</span>
              </div>
            </Link>
            <Link to="/contratos/historico">
              <div className="border border-border rounded-lg p-3 sm:p-4 hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer">
                <ScrollText size={18} className="mx-auto mb-2 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Contratos</span>
              </div>
            </Link>
            <Link to="/checklists/historico">
              <div className="border border-border rounded-lg p-3 sm:p-4 hover:border-primary hover:bg-accent/10 transition-colors cursor-pointer">
                <ClipboardCheck size={18} className="mx-auto mb-2 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Checklists</span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
      {/* Password Change Dialog */}
      <Dialog open={senhaDialogOpen} onOpenChange={setSenhaDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Trocar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nova Senha</Label>
              <Input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <Label>Confirmar Senha</Label>
              <Input type="password" value={confirmSenha} onChange={e => setConfirmSenha(e.target.value)} placeholder="Repita a senha" />
            </div>
            <Button onClick={trocarSenha} disabled={salvandoSenha} className="w-full">
              {salvandoSenha ? "Salvando..." : "Alterar Senha"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
