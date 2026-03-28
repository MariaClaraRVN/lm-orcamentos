import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listarContratos, excluirContrato, ContratoSalvo } from "@/hooks/useContratos";
import { ScrollText, Calendar, User, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";

export default function ContratosHistorico() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<ContratoSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    listarContratos().then((list) => {
      setContratos(list);
      setLoading(false);
    });
  };

  useEffect(() => { carregar(); }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeletandoId(confirmId);
    try {
      await excluirContrato(confirmId);
      setContratos((prev) => prev.filter((c) => c.id !== confirmId));
      toast({ title: "Contrato excluído" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setDeletandoId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader titulo="Histórico de Contratos" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Contratos</h2>
          <Button size="sm" onClick={() => navigate("/contrato/novo")}>
            <ScrollText size={14} className="mr-1" /> Novo Contrato
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-10">Carregando...</p>
        ) : contratos.length === 0 ? (
          <div className="text-center py-16">
            <ScrollText size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Nenhum contrato encontrado.</p>
            <Button className="mt-4" onClick={() => navigate("/contrato/novo")}>
              Criar Primeiro Contrato
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {contratos.map((c) => (
              <div key={c.id} className="border border-border rounded-lg p-3 sm:p-4 bg-card hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-primary shrink-0" />
                      <span className="font-semibold text-sm truncate">
                        {c.contratante_razao_social || "Sem nome"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      <span>{c.data_contrato || new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {c.equipamento_descricao && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Equip.: {c.equipamento_descricao}
                      </p>
                    )}
                    {c.valor_mensal && (
                      <p className="text-xs font-medium text-primary mt-1">
                        Mensal: {c.valor_mensal}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(`/contrato/${c.id}`)}>
                      <Eye size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      disabled={deletandoId === c.id}
                      onClick={() => setConfirmId(c.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
