import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  buscarChecklist,
  atualizarItemChecklist,
  atualizarChecklist,
  ChecklistSalvo,
  ChecklistItem,
} from "@/hooks/useChecklists";

export default function ChecklistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistSalvo | null>(null);
  const [itens, setItens] = useState<ChecklistItem[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    buscarChecklist(id).then(c => {
      setChecklist(c);
      setItens(c?.itens ?? []);
      setObservacoes(c?.observacoes ?? "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const toggleItem = async (item: ChecklistItem) => {
    const newVal = !item.feito;
    setItens(prev => prev.map(i => i.id === item.id ? { ...i, feito: newVal } : i));
    try {
      await atualizarItemChecklist(item.id, newVal);
    } catch {
      setItens(prev => prev.map(i => i.id === item.id ? { ...i, feito: !newVal } : i));
      toast({ title: "Erro ao atualizar item", variant: "destructive" });
    }
  };

  const salvar = async () => {
    if (!id) return;
    setSalvando(true);
    try {
      const todosFeitos = itens.every(i => i.feito);
      await atualizarChecklist(id, { observacoes, concluido: todosFeitos });
      toast({ title: "Checklist salvo!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><PageHeader titulo="Checklist" /><p className="text-center py-10 text-muted-foreground">Carregando...</p></div>;
  if (!checklist) return <div className="min-h-screen bg-background"><PageHeader titulo="Checklist" /><p className="text-center py-10 text-muted-foreground">Checklist não encontrado.</p></div>;

  // Group items by category
  const categorias = Array.from(new Set(itens.map(i => i.categoria)));
  const feitos = itens.filter(i => i.feito).length;
  const total = itens.length;
  const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titulo="Checklist de Manutenção" />
      <main className="max-w-3xl mx-auto px-3 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/checklists/historico")}>
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>

        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="flex flex-wrap gap-4 text-sm">
            <div><span className="text-muted-foreground">Cliente:</span> <strong>{checklist.cliente_nome}</strong></div>
            <div><span className="text-muted-foreground">Técnico:</span> <strong>{checklist.tecnico}</strong></div>
            <div><span className="text-muted-foreground">Data:</span> {checklist.data_execucao}</div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progresso: {feitos}/{total}</span>
              <span className={progresso === 100 ? "text-primary font-bold" : "text-muted-foreground"}>{progresso}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${progresso}%` }} />
            </div>
          </div>
        </div>

        {categorias.map(cat => (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary">{cat}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {itens.filter(i => i.categoria === cat).map(item => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-accent/10 transition-colors">
                  <Checkbox
                    checked={item.feito}
                    onCheckedChange={() => toggleItem(item)}
                    className="mt-0.5"
                  />
                  <span className={`text-sm ${item.feito ? "line-through text-muted-foreground" : ""}`}>
                    {item.descricao}
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Observações sobre a manutenção..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Button onClick={salvar} disabled={salvando} className="w-full py-5 font-bold">
          <Save size={18} className="mr-2" />
          {salvando ? "Salvando..." : "Salvar Checklist"}
        </Button>
      </main>
    </div>
  );
}
