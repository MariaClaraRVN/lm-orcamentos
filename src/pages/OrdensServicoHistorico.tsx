import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Calendar, User, Eye, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  listarOrdensServico, excluirOrdemServico, OrdemServico,
  STATUS_LABELS, STATUS_COLORS,
} from "@/hooks/useOrdensServico";

export default function OrdensServicoHistorico() {
  const [lista, setLista] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  useEffect(() => {
    listarOrdensServico().then((data) => {
      setLista(data);
      setLoading(false);
    });
  }, []);

  const handleExcluir = async () => {
    if (!confirmId) return;
    setDeletandoId(confirmId);
    setConfirmId(null);
    const ok = await excluirOrdemServico(confirmId);
    if (ok) {
      setLista((prev) => prev.filter((o) => o.id !== confirmId));
      toast({ title: "OS excluída", description: "Ordem de Serviço removida." });
    } else {
      toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
    }
    setDeletandoId(null);
  };

  const getNome = (os: OrdemServico) =>
    (os.tipo_pessoa === "fisica" ? os.cliente_nome_pessoa : os.cliente_nome) || "Cliente";

  const filtradas = filtroStatus === "todos" ? lista : lista.filter((o) => o.status === filtroStatus);

  const isProximoAbandono = (os: OrdemServico) => {
    if (!os.data_limite_abandono || os.status === "entregue" || os.status === "abandonado") return false;
    const limite = new Date(os.data_limite_abandono);
    const agora = new Date();
    const diff = (limite.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 15;
  };

  const isAbandonado = (os: OrdemServico) => {
    if (!os.data_limite_abandono) return false;
    return new Date(os.data_limite_abandono) < new Date();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[hsl(var(--brand-black))] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/"><img style={{ maxWidth: "100px" }} src="/Icon.png" alt="Logo LM" /></Link>
          <span className="text-sm text-gray-400 hidden sm:block">Histórico de Ordens de Serviço</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-foreground">Histórico de OS</h1>
          <Link to="/">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ArrowLeft size={16} className="mr-2" /> Voltar
            </Button>
          </Link>
        </div>

        {/* Filtro por status */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filtroStatus === "todos" ? "default" : "outline"} onClick={() => setFiltroStatus("todos")} className={filtroStatus === "todos" ? "bg-primary text-primary-foreground" : "border-primary text-primary"}>Todos</Button>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <Button key={key} size="sm" variant={filtroStatus === key ? "default" : "outline"} onClick={() => setFiltroStatus(key)} className={filtroStatus === key ? "bg-primary text-primary-foreground" : "border-border text-foreground text-xs"}>
              {label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Carregando...</div>
        ) : filtradas.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
            <Wrench size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">Nenhuma Ordem de Serviço encontrada.</p>
            <Link to="/os/nova">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Criar primeira OS</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-primary px-6 py-3">
              <h2 className="text-primary-foreground font-bold text-base">
                {filtradas.length} OS encontrada{filtradas.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {filtradas.map((os, idx) => (
                <div key={os.id} className={`p-4 ${idx % 2 === 0 ? "bg-card" : "bg-[hsl(var(--table-row-alt))]"} ${isProximoAbandono(os) ? "border-l-4 border-l-destructive" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ClipboardList size={16} className="text-primary" />
                        <span className="font-bold text-foreground">{os.numero}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[os.status] || "bg-muted text-muted-foreground"}`}>
                          {STATUS_LABELS[os.status] || os.status}
                        </span>
                        {isProximoAbandono(os) && !isAbandonado(os) && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30">⚠ Prazo próximo</span>
                        )}
                        {isAbandonado(os) && os.status !== "abandonado" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">⏰ Prazo expirado</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User size={13} /> {getNome(os)}</span>
                        <span className="flex items-center gap-1"><Wrench size={13} /> {os.marca} {os.modelo}</span>
                        <span className="flex items-center gap-1"><Calendar size={13} /> {os.data_retirada || new Date(os.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/os/${os.id}`}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Eye size={14} className="mr-1" /> Abrir
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" disabled={deletandoId === os.id} onClick={() => setConfirmId(os.id)} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ordem de Serviço?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A OS e todos os dados relacionados serão removidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="mt-12 bg-[hsl(var(--brand-black))] text-gray-400 text-xs text-center py-4">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
