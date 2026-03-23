import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarContrato, ContratoSalvo } from "@/hooks/useContratos";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContratoPDF from "@/components/ContratoPDF";
import type { DadosContrato } from "@/pages/ContratoNovo";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

function toFormData(c: ContratoSalvo): DadosContrato {
  return {
    contratadaRazaoSocial: c.contratada_razao_social,
    contratadaCnpj: c.contratada_cnpj,
    contratadaEndereco: c.contratada_endereco,
    contratanteRazaoSocial: c.contratante_razao_social,
    contratanteCnpj: c.contratante_cnpj,
    contratanteEndereco: c.contratante_endereco,
    equipamentoDescricao: c.equipamento_descricao,
    valorVisitaEmergencia: c.valor_visita_emergencia,
    valorMensal: c.valor_mensal,
    cidade: c.cidade,
    dataContrato: c.data_contrato,
  };
}

export default function ContratoView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [contrato, setContrato] = useState<ContratoSalvo | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    if (!id) return;
    buscarContrato(id).then((c) => {
      setContrato(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const gerarPDF = async () => {
    if (!pdfRef.current || !contrato) return;
    setGerando(true);
    try {
      const el = pdfRef.current;
      el.style.display = "block";
      const pages = el.querySelectorAll("[data-page]");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794, windowWidth: 794 });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      el.style.display = "none";
      pdf.save(`Contrato-${contrato.contratante_razao_social || "Contrato"}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "PDF gerado!" });
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><PageHeader titulo="Contrato" /><p className="text-center py-10 text-muted-foreground">Carregando...</p></div>;
  if (!contrato) return <div className="min-h-screen bg-background"><PageHeader titulo="Contrato" /><p className="text-center py-10 text-muted-foreground">Contrato não encontrado.</p></div>;

  const dados = toFormData(contrato);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titulo="Visualizar Contrato" />
      <main className="max-w-3xl mx-auto px-3 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/contratos/historico")}>
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>

        <div className="border border-border rounded-lg p-4 bg-card space-y-3">
          <h2 className="font-bold text-base">Contrato de Manutenção Preventiva</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Contratante:</span> <strong>{contrato.contratante_razao_social}</strong></div>
            <div><span className="text-muted-foreground">CNPJ:</span> {contrato.contratante_cnpj}</div>
            <div><span className="text-muted-foreground">Contratada:</span> <strong>{contrato.contratada_razao_social}</strong></div>
            <div><span className="text-muted-foreground">CNPJ:</span> {contrato.contratada_cnpj}</div>
            <div><span className="text-muted-foreground">Equipamento:</span> {contrato.equipamento_descricao}</div>
            <div><span className="text-muted-foreground">Valor Mensal:</span> {contrato.valor_mensal}</div>
            <div><span className="text-muted-foreground">Cidade:</span> {contrato.cidade}</div>
            <div><span className="text-muted-foreground">Data:</span> {contrato.data_contrato}</div>
          </div>
        </div>

        <Button onClick={gerarPDF} disabled={gerando} className="w-full py-5 font-bold">
          <FileDown size={18} className="mr-2" />
          {gerando ? "Gerando PDF..." : "Gerar PDF do Contrato"}
        </Button>
      </main>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ContratoPDF ref={pdfRef} dados={dados} />
      </div>
    </div>
  );
}
