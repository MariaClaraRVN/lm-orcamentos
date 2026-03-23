import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { salvarContrato } from "@/hooks/useContratos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import ContratoPDF from "@/components/ContratoPDF";
import { ArrowLeft, FileDown, Save } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

export interface DadosContrato {
  // Contratada
  contratadaRazaoSocial: string;
  contratadaCnpj: string;
  contratadaEndereco: string;
  // Contratante
  contratanteRazaoSocial: string;
  contratanteCnpj: string;
  contratanteEndereco: string;
  // Equipamento
  equipamentoDescricao: string;
  // Valores
  valorVisitaEmergencia: string;
  valorMensal: string;
  // Local e data
  cidade: string;
  dataContrato: string;
}

const initialData: DadosContrato = {
  contratadaRazaoSocial: "",
  contratadaCnpj: "",
  contratadaEndereco: "",
  contratanteRazaoSocial: "",
  contratanteCnpj: "",
  contratanteEndereco: "",
  equipamentoDescricao: "",
  valorVisitaEmergencia: "",
  valorMensal: "",
  cidade: "",
  dataContrato: "",
};

export default function ContratoNovo() {
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [dados, setDados] = useState<DadosContrato>(initialData);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleChange = (field: keyof DadosContrato, value: string) => {
    setDados(prev => ({ ...prev, [field]: value }));
  };

  const gerarPDF = async () => {
    if (!pdfRef.current) return;
    setGerando(true);
    try {
      const el = pdfRef.current;
      el.style.display = "block";

      // Get all pages
      const pages = el.querySelectorAll('[data-page]');
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: 794,
          windowWidth: 794,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      el.style.display = "none";

      const nomeArquivo = `Contrato-${dados.contratanteRazaoSocial || "Novo"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(nomeArquivo);
      toast({ title: "PDF gerado!", description: nomeArquivo });
    } catch (err) {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titulo="Novo Contrato de Manutenção" />

      <main className="max-w-3xl mx-auto px-3 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-2">
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>

        {/* Dados da Contratada */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados da Contratada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Razão Social</Label>
              <Input value={dados.contratadaRazaoSocial} onChange={e => handleChange("contratadaRazaoSocial", e.target.value)} placeholder="Razão social da contratada" />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input value={dados.contratadaCnpj} onChange={e => handleChange("contratadaCnpj", e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <Label>Endereço Completo</Label>
              <Input value={dados.contratadaEndereco} onChange={e => handleChange("contratadaEndereco", e.target.value)} placeholder="Endereço completo" />
            </div>
          </CardContent>
        </Card>

        {/* Dados da Contratante */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados da Contratante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Razão Social</Label>
              <Input value={dados.contratanteRazaoSocial} onChange={e => handleChange("contratanteRazaoSocial", e.target.value)} placeholder="Razão social da contratante" />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input value={dados.contratanteCnpj} onChange={e => handleChange("contratanteCnpj", e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <Label>Endereço Completo</Label>
              <Input value={dados.contratanteEndereco} onChange={e => handleChange("contratanteEndereco", e.target.value)} placeholder="Endereço completo" />
            </div>
          </CardContent>
        </Card>

        {/* Equipamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Marca / Modelo / Especificação</Label>
              <Input value={dados.equipamentoDescricao} onChange={e => handleChange("equipamentoDescricao", e.target.value)} placeholder="Ex: Gerador Cummins 150kVA" />
            </div>
          </CardContent>
        </Card>

        {/* Valores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Valor por Visita de Emergência</Label>
              <Input value={dados.valorVisitaEmergencia} onChange={e => handleChange("valorVisitaEmergencia", e.target.value)} placeholder="Ex: R$ 350,00 por visita" />
            </div>
            <div>
              <Label>Valor Mensal do Contrato</Label>
              <Input value={dados.valorMensal} onChange={e => handleChange("valorMensal", e.target.value)} placeholder="Ex: R$ 1.500,00" />
            </div>
          </CardContent>
        </Card>

        {/* Local e Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Local e Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Cidade</Label>
              <Input value={dados.cidade} onChange={e => handleChange("cidade", e.target.value)} placeholder="Ex: São Paulo - SP" />
            </div>
            <div>
              <Label>Data do Contrato</Label>
              <Input value={dados.dataContrato} onChange={e => handleChange("dataContrato", e.target.value)} placeholder="Ex: 23 de março de 2026" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={async () => {
            setSalvando(true);
            try {
              await salvarContrato({
                contratada_razao_social: dados.contratadaRazaoSocial,
                contratada_cnpj: dados.contratadaCnpj,
                contratada_endereco: dados.contratadaEndereco,
                contratante_razao_social: dados.contratanteRazaoSocial,
                contratante_cnpj: dados.contratanteCnpj,
                contratante_endereco: dados.contratanteEndereco,
                equipamento_descricao: dados.equipamentoDescricao,
                valor_visita_emergencia: dados.valorVisitaEmergencia,
                valor_mensal: dados.valorMensal,
                cidade: dados.cidade,
                data_contrato: dados.dataContrato,
              });
              toast({ title: "Contrato salvo!" });
              navigate("/contratos/historico");
            } catch {
              toast({ title: "Erro ao salvar", variant: "destructive" });
            } finally { setSalvando(false); }
          }} disabled={salvando} variant="outline" className="py-6 text-base font-bold">
            <Save size={20} className="mr-2" />
            {salvando ? "Salvando..." : "Salvar Contrato"}
          </Button>
          <Button onClick={gerarPDF} disabled={gerando} className="py-6 text-base font-bold">
            <FileDown size={20} className="mr-2" />
            {gerando ? "Gerando PDF..." : "Gerar PDF"}
          </Button>
        </div>
      </main>

      {/* PDF Hidden */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ContratoPDF ref={pdfRef} dados={dados} />
      </div>
    </div>
  );
}
