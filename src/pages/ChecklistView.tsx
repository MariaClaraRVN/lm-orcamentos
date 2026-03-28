import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, Save, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  buscarChecklist,
  atualizarItemChecklist,
  atualizarChecklist,
  ChecklistSalvo,
  ChecklistItem,
  ChecklistItemStatus,
} from "@/hooks/useChecklists";
import ChecklistPDF from "@/components/ChecklistPDF";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ChecklistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<ChecklistSalvo | null>(null);
  const [itens, setItens] = useState<ChecklistItem[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    buscarChecklist(id).then(c => {
      setChecklist(c);
      setItens(c?.itens ?? []);
      setObservacoes(c?.observacoes ?? "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const changeStatus = async (item: ChecklistItem, newStatus: ChecklistItemStatus) => {
    const oldStatus = item.status;
    setItens(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
    try {
      await atualizarItemChecklist(item.id, newStatus);
    } catch {
      setItens(prev => prev.map(i => i.id === item.id ? { ...i, status: oldStatus } : i));
      toast({ title: "Erro ao atualizar item", variant: "destructive" });
    }
  };

  const salvar = async () => {
    if (!id) return;
    setSalvando(true);
    try {
      const todosRespondidos = itens.every(i => i.status !== "pendente");
      await atualizarChecklist(id, { observacoes, concluido: todosRespondidos });
      toast({ title: "Checklist salvo!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const gerarPDF = async () => {
    if (!pdfRef.current || !checklist) return;
    setGerando(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgW = pdfW;
      const imgH = pdfW / ratio;

      if (imgH <= pdfH) {
        pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
      } else {
        let y = 0;
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        const pageHeightPx = (pdfH / pdfW) * canvas.width;
        while (y < canvas.height) {
          const h = Math.min(pageHeightPx, canvas.height - y);
          pageCanvas.height = h;
          const ctx = pageCanvas.getContext("2d")!;
          ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
          const pageImg = pageCanvas.toDataURL("image/png");
          if (y > 0) pdf.addPage();
          pdf.addImage(pageImg, "PNG", 0, 0, pdfW, (h / canvas.width) * pdfW);
          y += pageHeightPx;
        }
      }
      pdf.save(`Checklist-${checklist.cliente_nome}-${checklist.data_execucao.replace(/\//g, "-")}.pdf`);
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><PageHeader titulo="Checklist" /><p className="text-center py-10 text-muted-foreground">Carregando...</p></div>;
  if (!checklist) return <div className="min-h-screen bg-background"><PageHeader titulo="Checklist" /><p className="text-center py-10 text-muted-foreground">Checklist não encontrado.</p></div>;

  const categorias = Array.from(new Set(itens.map(i => i.categoria)));
  const respondidos = itens.filter(i => i.status !== "pendente").length;
  const total = itens.length;
  const progresso = total > 0 ? Math.round((respondidos / total) * 100) : 0;

  const statusLabel = (s: ChecklistItemStatus) => {
    if (s === "sim") return "Sim";
    if (s === "nao") return "Não";
    if (s === "nao_contem") return "Não contém";
    return "Pendente";
  };

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
              <span>Progresso: {respondidos}/{total}</span>
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
            <CardContent className="space-y-3">
              {itens.filter(i => i.categoria === cat).map(item => (
                <div key={item.id} className="p-2 rounded hover:bg-accent/10 transition-colors">
                  <p className="text-sm font-medium mb-2">{item.descricao}</p>
                  <RadioGroup
                    value={item.status === "pendente" ? undefined : item.status}
                    onValueChange={(val) => changeStatus(item, val as ChecklistItemStatus)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="sim" id={`${item.id}-sim`} />
                      <Label htmlFor={`${item.id}-sim`} className="text-xs cursor-pointer">Sim</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="nao" id={`${item.id}-nao`} />
                      <Label htmlFor={`${item.id}-nao`} className="text-xs cursor-pointer">Não</Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="nao_contem" id={`${item.id}-nc`} />
                      <Label htmlFor={`${item.id}-nc`} className="text-xs cursor-pointer">Não contém</Label>
                    </div>
                  </RadioGroup>
                </div>
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

        <div className="flex gap-3">
          <Button onClick={salvar} disabled={salvando} className="flex-1 py-5 font-bold">
            <Save size={18} className="mr-2" />
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={gerarPDF} disabled={gerando} variant="outline" className="flex-1 py-5 font-bold">
            <FileDown size={18} className="mr-2" />
            {gerando ? "Gerando..." : "Exportar PDF"}
          </Button>
        </div>
      </main>

      {/* Hidden PDF template */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ChecklistPDF ref={pdfRef} checklist={checklist} itens={itens} observacoes={observacoes} />
      </div>
    </div>
  );
}
