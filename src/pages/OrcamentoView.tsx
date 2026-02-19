import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileDown, Share2, Check, FilePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrcamentoPDF from "@/components/OrcamentoPDF";
import { buscarOrcamento, OrcamentoSalvo } from "@/hooks/useOrcamentos";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function OrcamentoView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orcamento, setOrcamento] = useState<OrcamentoSalvo | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    buscarOrcamento(id).then((data) => {
      setOrcamento(data);
      setLoading(false);
    });
  }, [id]);

  const gerarPDF = async () => {
    if (!pdfRef.current) return;
    setGerando(true);
    await new Promise((r) => setTimeout(r, 200));
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const nomeCliente = orcamento?.cliente_nome
        ? orcamento.cliente_nome.replace(/\s+/g, "_").toLowerCase()
        : "orcamento";
      pdf.save(`orcamento_lm_${nomeCliente}.pdf`);
    } finally {
      setGerando(false);
    }
  };

  const compartilhar = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Orçamento LM Manutenções${orcamento?.cliente_nome ? ` — ${orcamento.cliente_nome}` : ""}`,
          text: `Confira o orçamento para ${orcamento?.cliente_nome || "seu serviço"}.`,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      toast({ title: "Link copiado!", description: "O link do orçamento foi copiado para a área de transferência." });
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const reabrirNoFormulario = () => {
    if (!orcamento) return;
    navigate("/", {
      state: {
        orcamentoParaEditar: {
          clienteNome: orcamento.cliente_nome,
          clienteCnpj: orcamento.cliente_cnpj,
          clienteEndereco: orcamento.cliente_endereco,
          observacoes: orcamento.observacoes,
          itens: orcamento.itens ?? [],
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Carregando orçamento...</span>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Orçamento não encontrado.</p>
        <Link to="/historico">
          <Button variant="outline">Voltar ao Histórico</Button>
        </Link>
      </div>
    );
  }

  const dados = {
    numero: orcamento.numero,
    data: orcamento.data,
    clienteNome: orcamento.cliente_nome,
    clienteCnpj: orcamento.cliente_cnpj,
    clienteEndereco: orcamento.cliente_endereco,
    itens: orcamento.itens ?? [],
    observacoes: orcamento.observacoes,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-[hsl(var(--brand-black))] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-2xl tracking-wide">L</span>
            <span className="text-[hsl(var(--brand-green-light))] font-black text-2xl">⚡M MANUTENÇÕES</span>
          </div>
          <span className="text-sm text-gray-400 hidden sm:block">Visualização de Orçamento</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb / Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link to="/historico" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-1">
              <ArrowLeft size={14} />
              Histórico
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Orçamento #{orcamento.numero}
              {orcamento.cliente_nome && (
                <span className="text-primary"> — {orcamento.cliente_nome}</span>
              )}
            </h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={reabrirNoFormulario}
              className="border-muted-foreground text-muted-foreground hover:bg-muted"
            >
              <FilePen size={15} className="mr-2" />
              Reabrir no Formulário
            </Button>
            <Button
              variant="outline"
              onClick={compartilhar}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {copiado ? <Check size={15} className="mr-2" /> : <Share2 size={15} className="mr-2" />}
              {copiado ? "Link copiado!" : "Compartilhar"}
            </Button>
            <Button
              onClick={gerarPDF}
              disabled={gerando}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              <FileDown size={15} className="mr-2" />
              {gerando ? "Gerando PDF..." : "Baixar PDF"}
            </Button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="bg-primary px-6 py-3">
            <h2 className="text-primary-foreground font-bold text-base">Preview do Orçamento</h2>
          </div>
          <div className="p-4 overflow-x-auto bg-gray-100">
            <div className="shadow-xl inline-block">
              <OrcamentoPDF ref={pdfRef} dados={dados} />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-[hsl(var(--brand-black))] text-gray-400 text-xs text-center py-4">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Orçamentos
      </footer>
    </div>
  );
}
