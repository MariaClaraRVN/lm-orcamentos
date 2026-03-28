import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { salvarContrato } from "@/hooks/useContratos";
import { salvarCliente, listarClientes, ClienteSalvo } from "@/hooks/useClientes";
import PageHeader from "@/components/PageHeader";
import ContratoPDF from "@/components/ContratoPDF";
import { ArrowLeft, FileDown, Save, Search, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import { validarCPF, validarCNPJ, maskCNPJ, maskCPF, maskCEP } from "@/lib/validators";
import { buscarCEP, buscarCNPJ } from "@/lib/apiUtils";

export interface DadosContrato {
  tipoPessoa: "juridica" | "fisica";
  contratadaRazaoSocial: string;
  contratadaCnpj: string;
  contratadaEndereco: string;
  contratanteRazaoSocial: string;
  contratanteCnpj: string;
  contratanteCpf: string;
  contratanteNomePessoa: string;
  contratanteEndereco: string;
  contratanteCep: string;
  contratanteNumero: string;
  marcaMaquina: string;
  modeloMaquina: string;
  valorVisitaEmergencia: string;
  valorMensal: string;
  cidade: string;
  dataContrato: string;
}

const hoje = () => {
  const d = new Date();
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
};

// Dados fixos da contratada
const CONTRATADA = {
  razaoSocial: "Lincoln Carlos Vianna",
  cnpj: "40.080.991/0001-84",
  endereco: "Rua Jaboticabal, 18, Vila Dirce, Carapicuíba - SP, CEP 06335-310",
  telefone: "(11) 99455-4797",
  inscricaoEstadual: "255.555.910.118",
};

const initialData: DadosContrato = {
  tipoPessoa: "juridica",
  contratadaRazaoSocial: CONTRATADA.razaoSocial,
  contratadaCnpj: CONTRATADA.cnpj,
  contratadaEndereco: CONTRATADA.endereco,
  contratanteRazaoSocial: "",
  contratanteCnpj: "",
  contratanteCpf: "",
  contratanteNomePessoa: "",
  contratanteEndereco: "",
  contratanteCep: "",
  contratanteNumero: "",
  marcaMaquina: "",
  modeloMaquina: "",
  valorVisitaEmergencia: "",
  valorMensal: "",
  cidade: "Carapicuíba - SP",
  dataContrato: hoje(),
};

export default function ContratoNovo() {
  const navigate = useNavigate();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [dados, setDados] = useState<DadosContrato>(initialData);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [clientes, setClientes] = useState<ClienteSalvo[]>([]);
  const [showClientes, setShowClientes] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

  useEffect(() => {
    listarClientes().then(setClientes).catch(() => {});
  }, []);

  const handleChange = (field: keyof DadosContrato, value: string) => {
    setDados(prev => ({ ...prev, [field]: value }));
    setErros(prev => ({ ...prev, [field]: "" }));
  };

  // Auto-fill CEP
  const handleCepChange = async (cep: string) => {
    const masked = maskCEP(cep);
    handleChange("contratanteCep", masked);
    const digits = masked.replace(/\D/g, "");
    if (digits.length === 8) {
      setBuscandoCep(true);
      const result = await buscarCEP(digits);
      setBuscandoCep(false);
      if (result) {
        const endereco = [result.logradouro, result.bairro, `${result.localidade} - ${result.uf}`].filter(Boolean).join(", ");
        setDados(prev => ({
          ...prev,
          contratanteEndereco: endereco,
          cidade: `${result.localidade} - ${result.uf}`,
        }));
        toast({ title: "Endereço encontrado!" });
      } else {
        toast({ title: "CEP não encontrado", variant: "destructive" });
      }
    }
  };

  // Auto-fill CNPJ
  const handleCnpjChange = async (value: string) => {
    const masked = maskCNPJ(value);
    handleChange("contratanteCnpj", masked);
    const digits = masked.replace(/\D/g, "");
    if (digits.length === 14 && validarCNPJ(masked)) {
      setBuscandoCnpj(true);
      const result = await buscarCNPJ(digits);
      setBuscandoCnpj(false);
      if (result) {
        const endereco = [result.logradouro, result.bairro, `${result.municipio} - ${result.uf}`].filter(Boolean).join(", ");
        setDados(prev => ({
          ...prev,
          contratanteRazaoSocial: result.nome || prev.contratanteRazaoSocial,
          contratanteEndereco: endereco,
          contratanteNumero: result.numero || "",
          contratanteCep: maskCEP(result.cep || ""),
          cidade: `${result.municipio} - ${result.uf}`,
        }));
        toast({ title: "Dados do CNPJ encontrados!" });
      }
    }
  };

  const validar = (): boolean => {
    const e: Record<string, string> = {};
    if (dados.tipoPessoa === "juridica") {
      if (dados.contratanteCnpj && !validarCNPJ(dados.contratanteCnpj)) e.contratanteCnpj = "CNPJ inválido";
    } else {
      if (dados.contratanteCpf && !validarCPF(dados.contratanteCpf)) e.contratanteCpf = "CPF inválido";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const selecionarCliente = (c: ClienteSalvo) => {
    setDados(prev => ({
      ...prev,
      tipoPessoa: c.tipo_pessoa as "juridica" | "fisica",
      contratanteRazaoSocial: c.nome,
      contratanteCnpj: c.cnpj,
      contratanteCpf: c.cpf,
      contratanteNomePessoa: c.nome_pessoa,
      contratanteEndereco: c.endereco,
    }));
    setShowClientes(false);
    toast({ title: "Cliente selecionado!" });
  };

  const enderecoCompleto = () => {
    const parts = [dados.contratanteEndereco];
    if (dados.contratanteNumero) parts[0] = `${dados.contratanteEndereco}, ${dados.contratanteNumero}`;
    return parts.join("");
  };

  const gerarPDF = async () => {
    if (!pdfRef.current) return;
    if (!validar()) return toast({ title: "Corrija os erros antes de gerar", variant: "destructive" });
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
      const nome = `Contrato-${dados.contratanteRazaoSocial || dados.contratanteNomePessoa || "Novo"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(nome);
      toast({ title: "PDF gerado!", description: nome });
    } catch {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  const salvar = async () => {
    if (!validar()) return toast({ title: "Corrija os erros antes de salvar", variant: "destructive" });
    setSalvando(true);
    try {
      const endFull = enderecoCompleto();
      await salvarContrato({
        contratada_razao_social: CONTRATADA.razaoSocial,
        contratada_cnpj: CONTRATADA.cnpj,
        contratada_endereco: CONTRATADA.endereco,
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

      try {
        await salvarCliente({
          nome: dados.contratanteRazaoSocial,
          cnpj: dados.contratanteCnpj,
          cpf: dados.contratanteCpf,
          endereco: endFull,
          email: "",
          telefone: "",
          nome_pessoa: dados.contratanteNomePessoa,
          tipo_pessoa: dados.tipoPessoa,
        });
      } catch { /* ignore */ }

      toast({ title: "Contrato salvo!" });
      navigate("/contratos/historico");
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const isPF = dados.tipoPessoa === "fisica";
  const dadosPDF: DadosContrato = { ...dados, contratanteEndereco: enderecoCompleto() };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader titulo="Novo Contrato de Manutenção" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-2">
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>

        {clientes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search size={16} /> Selecionar Cliente Salvo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => setShowClientes(!showClientes)} className="mb-2">
                {showClientes ? "Fechar lista" : `Ver clientes salvos (${clientes.length})`}
              </Button>
              {showClientes && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {clientes.map(c => (
                    <div key={c.id} onClick={() => selecionarCliente(c)} className="border border-border rounded p-2 cursor-pointer hover:bg-accent/10 transition-colors text-sm">
                      <strong>{c.nome || c.nome_pessoa}</strong>
                      <span className="text-muted-foreground ml-2">{c.cnpj || c.cpf}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tipo de pessoa */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Tipo de Contratante</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant={!isPF ? "default" : "outline"} size="sm" onClick={() => handleChange("tipoPessoa", "juridica")}>Pessoa Jurídica (CNPJ)</Button>
              <Button variant={isPF ? "default" : "outline"} size="sm" onClick={() => handleChange("tipoPessoa", "fisica")}>Pessoa Física (CPF)</Button>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Contratada - FIXO */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Dados da Contratada (fixo)</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Razão Social:</span> <strong>{CONTRATADA.razaoSocial}</strong></p>
            <p><span className="text-muted-foreground">CNPJ:</span> {CONTRATADA.cnpj}</p>
            <p><span className="text-muted-foreground">Inscrição Estadual SP:</span> {CONTRATADA.inscricaoEstadual}</p>
            <p><span className="text-muted-foreground">Telefone:</span> {CONTRATADA.telefone}</p>
            <p><span className="text-muted-foreground">Endereço:</span> {CONTRATADA.endereco}</p>
          </CardContent>
        </Card>

        {/* Dados da Contratante */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Dados da Contratante</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isPF ? (
              <>
                <div>
                  <Label>Nome Completo</Label>
                  <Input value={dados.contratanteNomePessoa} onChange={e => handleChange("contratanteNomePessoa", e.target.value)} placeholder="Nome completo" />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input value={dados.contratanteCpf} onChange={e => handleChange("contratanteCpf", maskCPF(e.target.value))} placeholder="000.000.000-00" />
                  {erros.contratanteCpf && <span className="text-destructive text-xs">{erros.contratanteCpf}</span>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>CNPJ {buscandoCnpj && <Loader2 size={12} className="inline animate-spin ml-1" />}</Label>
                  <Input value={dados.contratanteCnpj} onChange={e => handleCnpjChange(e.target.value)} placeholder="00.000.000/0000-00" />
                  {erros.contratanteCnpj && <span className="text-destructive text-xs">{erros.contratanteCnpj}</span>}
                </div>
                <div>
                  <Label>Razão Social</Label>
                  <Input value={dados.contratanteRazaoSocial} onChange={e => handleChange("contratanteRazaoSocial", e.target.value)} placeholder="Razão social da contratante" />
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CEP {buscandoCep && <Loader2 size={12} className="inline animate-spin ml-1" />}</Label>
                <Input value={dados.contratanteCep} onChange={e => handleCepChange(e.target.value)} placeholder="00000-000" />
              </div>
              <div>
                <Label>Número</Label>
                <Input value={dados.contratanteNumero} onChange={e => handleChange("contratanteNumero", e.target.value)} placeholder="Nº" />
              </div>
            </div>
            <div>
              <Label>Endereço (preenchido pelo CEP)</Label>
              <Input value={dados.contratanteEndereco} onChange={e => handleChange("contratanteEndereco", e.target.value)} placeholder="Rua, Bairro, Cidade - UF" />
            </div>
          </CardContent>
        </Card>

        {/* Equipamento */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Equipamento</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marca</Label>
                <Input value={dados.marcaMaquina} onChange={e => handleChange("marcaMaquina", e.target.value)} placeholder="Ex: Cummins" />
              </div>
              <div>
                <Label>Modelo</Label>
                <Input value={dados.modeloMaquina} onChange={e => handleChange("modeloMaquina", e.target.value)} placeholder="Ex: 150kVA" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Valores</CardTitle></CardHeader>
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
          <CardHeader className="pb-3"><CardTitle className="text-base">Local e Data</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Cidade</Label>
              <Input value={dados.cidade} onChange={e => handleChange("cidade", e.target.value)} placeholder="Ex: São Paulo - SP" />
            </div>
            <div>
              <Label>Data do Contrato</Label>
              <Input value={dados.dataContrato} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button onClick={salvar} disabled={salvando} variant="outline" className="py-6 text-base font-bold">
            <Save size={20} className="mr-2" />
            {salvando ? "Salvando..." : "Salvar Contrato"}
          </Button>
          <Button onClick={gerarPDF} disabled={gerando} className="py-6 text-base font-bold">
            <FileDown size={20} className="mr-2" />
            {gerando ? "Gerando PDF..." : "Gerar PDF"}
          </Button>
        </div>
      </main>

      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <ContratoPDF ref={pdfRef} dados={dadosPDF} />
      </div>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
