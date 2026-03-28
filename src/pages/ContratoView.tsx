import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarContrato, atualizarContrato, ContratoSalvo } from "@/hooks/useContratos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileDown, Save, Pencil } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContratoPDF from "@/components/ContratoPDF";
import type { DadosContrato } from "@/pages/ContratoNovo";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import { maskCNPJ, maskCPF, maskCEP } from "@/lib/validators";
import { buscarCEP, buscarCNPJ } from "@/lib/apiUtils";

function toFormData(c: ContratoSalvo): DadosContrato {
  return {
    tipoPessoa: (c.tipo_pessoa as "juridica" | "fisica") || "juridica",
    contratadaRazaoSocial: c.contratada_razao_social,
    contratadaCnpj: c.contratada_cnpj,
    contratadaEndereco: c.contratada_endereco,
    contratanteRazaoSocial: c.contratante_razao_social,
    contratanteCnpj: c.contratante_cnpj,
    contratanteCpf: c.contratante_cpf || "",
    contratanteNomePessoa: "",
    contratanteEndereco: c.contratante_endereco,
    contratanteCep: "",
    contratanteNumero: "",
    marcaMaquina: c.equipamento_descricao.split(" - ")[0] || "",
    modeloMaquina: c.equipamento_descricao.split(" - ")[1] || "",
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
  const [dados, setDados] = useState<DadosContrato | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    buscarContrato(id).then((c) => {
      setContrato(c);
      if (c) setDados(toFormData(c));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleChange = (field: keyof DadosContrato, value: string) => {
    setDados(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleCepChange = async (cep: string) => {
    const masked = maskCEP(cep);
    handleChange("contratanteCep", masked);
    const digits = masked.replace(/\D/g, "");
    if (digits.length === 8) {
      const result = await buscarCEP(digits);
      if (result) {
        const endereco = [result.logradouro, result.bairro, `${result.localidade} - ${result.uf}`].filter(Boolean).join(", ");
        setDados(prev => prev ? { ...prev, contratanteEndereco: endereco, cidade: `${result.localidade} - ${result.uf}` } : prev);
        toast({ title: "Endereço encontrado!" });
      }
    }
  };

  const salvarEdicao = async () => {
    if (!id || !dados) return;
    setSalvando(true);
    try {
      const endFull = dados.contratanteNumero 
        ? `${dados.contratanteEndereco}, ${dados.contratanteNumero}` 
        : dados.contratanteEndereco;
      const updated = await atualizarContrato(id, {
        contratante_razao_social: dados.contratanteRazaoSocial,
        contratante_cnpj: dados.contratanteCnpj,
        contratante_cpf: dados.contratanteCpf,
        contratante_endereco: endFull,
        equipamento_descricao: `${dados.marcaMaquina} - ${dados.modeloMaquina}`,
        valor_visita_emergencia: dados.valorVisitaEmergencia,
        valor_mensal: dados.valorMensal,
        cidade: dados.cidade,
        data_contrato: dados.dataContrato,
        tipo_pessoa: dados.tipoPessoa,
      });
      setContrato(updated);
      setEditando(false);
      toast({ title: "Contrato atualizado!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const gerarPDF = async () => {
    if (!pdfRef.current || !dados) return;
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
      pdf.save(`Contrato-${dados.contratanteRazaoSocial || "Contrato"}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "PDF gerado!" });
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><PageHeader titulo="Contrato" /><p className="text-center py-10 text-muted-foreground">Carregando...</p></div>;
  if (!contrato || !dados) return <div className="min-h-screen bg-background"><PageHeader titulo="Contrato" /><p className="text-center py-10 text-muted-foreground">Contrato não encontrado.</p></div>;

  const isPF = dados.tipoPessoa === "fisica";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader titulo="Visualizar Contrato" />
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/contratos/historico")}>
            <ArrowLeft size={16} className="mr-1" /> Voltar
          </Button>
          {!editando && (
            <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
              <Pencil size={14} className="mr-1" /> Editar
            </Button>
          )}
        </div>

        {editando ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dados do Contratante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={dados.tipoPessoa === "juridica" ? "default" : "outline"} onClick={() => handleChange("tipoPessoa", "juridica")}>CNPJ</Button>
                  <Button type="button" size="sm" variant={dados.tipoPessoa === "fisica" ? "default" : "outline"} onClick={() => handleChange("tipoPessoa", "fisica")}>CPF</Button>
                </div>
                <div>
                  <Label>{isPF ? "Nome Completo" : "Razão Social"}</Label>
                  <Input value={dados.contratanteRazaoSocial} onChange={e => handleChange("contratanteRazaoSocial", e.target.value)} />
                </div>
                {isPF ? (
                  <div>
                    <Label>CPF</Label>
                    <Input value={dados.contratanteCpf} onChange={e => handleChange("contratanteCpf", maskCPF(e.target.value))} />
                  </div>
                ) : (
                  <div>
                    <Label>CNPJ</Label>
                    <Input value={dados.contratanteCnpj} onChange={e => handleChange("contratanteCnpj", maskCNPJ(e.target.value))} />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <Label>CEP</Label>
                    <Input value={dados.contratanteCep} onChange={e => handleCepChange(e.target.value)} placeholder="00000-000" />
                  </div>
                  <div className="col-span-2">
                    <Label>Endereço</Label>
                    <Input value={dados.contratanteEndereco} onChange={e => handleChange("contratanteEndereco", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Número</Label>
                    <Input value={dados.contratanteNumero} onChange={e => handleChange("contratanteNumero", e.target.value)} />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input value={dados.cidade} onChange={e => handleChange("cidade", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Equipamento e Valores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Marca</Label>
                  <Input value={dados.marcaMaquina} onChange={e => handleChange("marcaMaquina", e.target.value)} placeholder="Ex: Cummins" />
                </div>
                <div>
                  <Label>Modelo</Label>
                  <Input value={dados.modeloMaquina} onChange={e => handleChange("modeloMaquina", e.target.value)} placeholder="Ex: 150kVA" />
                </div>
              </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Valor Mensal</Label>
                    <Input value={dados.valorMensal} onChange={e => handleChange("valorMensal", e.target.value)} />
                  </div>
                  <div>
                    <Label>Valor Visita Emergência</Label>
                    <Input value={dados.valorVisitaEmergencia} onChange={e => handleChange("valorVisitaEmergencia", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Data do Contrato</Label>
                  <Input value={dados.dataContrato} onChange={e => handleChange("dataContrato", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={salvarEdicao} disabled={salvando} className="flex-1 py-5 font-bold">
                <Save size={18} className="mr-2" />
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" onClick={() => { setDados(toFormData(contrato)); setEditando(false); }} className="py-5">
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="border border-border rounded-lg p-4 bg-card space-y-3">
              <h2 className="font-bold text-base">Contrato de Manutenção Preventiva</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Contratante:</span> <strong>{contrato.contratante_razao_social}</strong></div>
                <div><span className="text-muted-foreground">{isPF ? "CPF:" : "CNPJ:"}</span> {isPF ? contrato.contratante_cpf : contrato.contratante_cnpj}</div>
                <div><span className="text-muted-foreground">Endereço:</span> {contrato.contratante_endereco}</div>
                <div><span className="text-muted-foreground">Contratada:</span> <strong>{contrato.contratada_razao_social}</strong></div>
                <div><span className="text-muted-foreground">CNPJ:</span> {contrato.contratada_cnpj}</div>
                <div><span className="text-muted-foreground">Marca:</span> {contrato.equipamento_descricao.split(" - ")[0]}</div>
                <div><span className="text-muted-foreground">Modelo:</span> {contrato.equipamento_descricao.split(" - ")[1]}</div>
                <div><span className="text-muted-foreground">Valor Mensal:</span> {contrato.valor_mensal}</div>
                <div><span className="text-muted-foreground">Cidade:</span> {contrato.cidade}</div>
                <div><span className="text-muted-foreground">Data:</span> {contrato.data_contrato}</div>
              </div>
            </div>

            <Button onClick={gerarPDF} disabled={gerando} className="w-full py-5 font-bold">
              <FileDown size={18} className="mr-2" />
              {gerando ? "Gerando PDF..." : "Gerar PDF do Contrato"}
            </Button>
          </>
        )}
      </main>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ContratoPDF ref={pdfRef} dados={dados} />
      </div>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
