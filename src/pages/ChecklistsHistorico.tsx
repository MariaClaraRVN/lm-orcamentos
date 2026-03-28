import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, ClipboardCheck, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { listarChecklists, excluirChecklist, ChecklistSalvo } from "@/hooks/useChecklists";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ChecklistsHistorico() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<ChecklistSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [excluirId, setExcluirId] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    listarChecklists().then(setLista).finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const confirmarExclusao = async () => {
    if (!excluirId) return;
    try {
      await excluirChecklist(excluirId);
      toast({ title: "Checklist excluído!" });
      carregar();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setExcluirId(null);
    }
  };

  const listaFiltrada = lista.filter(c => {
    const matchCliente = !filtroCliente || c.cliente_nome.toLowerCase().includes(filtroCliente.toLowerCase());
    const matchData = !filtroData || c.data_execucao.includes(filtroData);
    return matchCliente && matchData;
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titulo="Checklists de Manutenção" />
      <main className="max-w-3xl mx-auto px-3 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
          <Button size="sm" onClick={() => navigate("/checklist/novo")}>
            <Plus size={16} className="mr-1" /> Novo Checklist
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={filtroCliente}
              onChange={e => setFiltroCliente(e.target.value)}
              placeholder="Filtrar por cliente..."
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Input
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
            placeholder="Filtrar por data..."
            className="w-40 h-9 text-sm"
          />
        </div>

        {loading ? (
          <p className="text-center py-10 text-muted-foreground">Carregando...</p>
        ) : listaFiltrada.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">Nenhum checklist encontrado.</p>
        ) : (
          <div className="space-y-3">
            {listaFiltrada.map(c => (
              <div key={c.id} className="border border-border rounded-lg p-4 bg-card flex items-center justify-between gap-3">
                <Link to={`/checklist/${c.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck size={16} className={c.concluido ? "text-primary" : "text-muted-foreground"} />
                    <strong className="text-sm truncate">{c.cliente_nome}</strong>
                    {c.concluido && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Concluído</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.tecnico && `Técnico: ${c.tecnico} · `}{c.data_execucao}
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setExcluirId(c.id)} className="text-destructive hover:text-destructive shrink-0">
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!excluirId} onOpenChange={(open) => !open && setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir checklist</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este checklist? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
