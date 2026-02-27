import { useEffect, useState } from "react";
import { listarOrcamentos, excluirOrcamento, OrcamentoSalvo } from "@/hooks/useOrcamentos";
import { Link } from "react-router-dom";
import { FileText, Calendar, User, DollarSign, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";

const formatMoeda = (valor: number) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const sanitizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9À-ÿ ]/g, "").replace(/\s+/g, "-");

export default function Historico() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    listarOrcamentos().then((list) => {
      setOrcamentos(list);
      setLoading(false);
    });
  }, []);

  const handleExcluir = async () => {
    if (!confirmId) return;
    setDeletandoId(confirmId);
    setConfirmId(null);
    const ok = await excluirOrcamento(confirmId);
    if (ok) {
      setOrcamentos((prev) => prev.filter((o) => o.id !== confirmId));
      toast({ title: "Orçamento excluído", description: "O orçamento foi removido do histórico." });
    } else {
      toast({ title: "Erro ao excluir", description: "Não foi possível excluir o orçamento.", variant: "destructive" });
    }
    setDeletandoId(null);
  };

  const getNomeCliente = (orc: OrcamentoSalvo) =>
    (orc.tipo_pessoa === "fisica" ? orc.cliente_nome_pessoa : orc.cliente_nome) || "Cliente";

  const orcamentoParaExcluir = orcamentos.find((o) => o.id === confirmId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader titulo="Histórico de Orçamentos" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 py-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Histórico de Orçamentos</h1>
          <Link to="/orcamento/novo">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
              Novo Orçamento
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Carregando...</div>
        ) : orcamentos.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm border border-border p-8 sm:p-12 text-center">
            <FileText size={40} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-base sm:text-lg">Nenhum orçamento gerado ainda.</p>
            <Link to="/orcamento/novo">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                Criar primeiro orçamento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-primary px-4 sm:px-6 py-3">
              <h2 className="text-primary-foreground font-bold text-sm sm:text-base">
                {orcamentos.length} orçamento{orcamentos.length !== 1 ? "s" : ""} gerado{orcamentos.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {orcamentos.map((orc, idx) => (
                <div key={orc.id} className={`p-3 sm:p-4 ${idx % 2 === 0 ? "bg-card" : "bg-[hsl(var(--table-row-alt))]"}`}>
                  <div className="flex flex-col gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-primary shrink-0" />
                        <span className="font-bold text-foreground text-sm truncate">
                          Orçamento-{sanitizeFileName(getNomeCliente(orc))}-{orc.data}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User size={12} />{getNomeCliente(orc)}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} />{orc.data}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1 text-base sm:text-lg font-bold text-foreground">
                          <DollarSign size={14} className="text-primary" />
                          {formatMoeda(orc.total)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(orc.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/orcamento/${orc.id}`}>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-2 sm:px-3">
                            <Eye size={13} className="mr-1" /> Abrir
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" disabled={deletandoId === orc.id} onClick={() => setConfirmId(orc.id)} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 px-2">
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent className="mx-3 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento{" "}
              <strong>{orcamentoParaExcluir ? `Orçamento-${sanitizeFileName(getNomeCliente(orcamentoParaExcluir))}-${orcamentoParaExcluir.data}` : ""}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Orçamentos
      </footer>
    </div>
  );
}
