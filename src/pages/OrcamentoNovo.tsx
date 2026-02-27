import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, FileDown, Eye, History } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OrcamentoPDF, { ItemOrcamento, DadosOrcamento } from "@/components/OrcamentoPDF";
import { salvarOrcamento } from "@/hooks/useOrcamentos";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PageHeader from "@/components/PageHeader";

const formatMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const gerarId = () => Math.random().toString(36).substring(2, 9);
const hoje = () => new Date().toLocaleDateString("pt-BR");

const maskCNPJ = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
};
const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
};
const maskTelefone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9À-ÿ ]/g, "").replace(/\s+/g, "_");

const LIMITS = { nome: 40, endereco: 80, descricao: 80, observacoes: 80 };

export default function OrcamentoNovo() {
  const location = useLocation();
  const orcamentoParaEditar = (location.state as any)?.orcamentoParaEditar;

  const [tipoPessoa, setTipoPessoa] = useState<"juridica" | "fisica">(orcamentoParaEditar?.tipoPessoa ?? "juridica");
  const [clienteNome, setClienteNome] = useState(orcamentoParaEditar?.clienteNome ?? "");
  const [clienteCnpj, setClienteCnpj] = useState(orcamentoParaEditar?.clienteCnpj ?? "");
  const [clienteCpf, setClienteCpf] = useState(orcamentoParaEditar?.clienteCpf ?? "");
  const [clienteNomePessoa, setClienteNomePessoa] = useState(orcamentoParaEditar?.clienteNomePessoa ?? "");
  const [clienteEndereco, setClienteEndereco] = useState(orcamentoParaEditar?.clienteEndereco ?? "");
  const [clienteEmail, setClienteEmail] = useState(orcamentoParaEditar?.clienteEmail ?? "");
  const [clienteTelefone, setClienteTelefone] = useState(orcamentoParaEditar?.clienteTelefone ?? "");
  const [marcaMaquina, setMarcaMaquina] = useState(orcamentoParaEditar?.marcaMaquina ?? "");
  const [modeloMaquina, setModeloMaquina] = useState(orcamentoParaEditar?.modeloMaquina ?? "");
  const [observacoes, setObservacoes] = useState(orcamentoParaEditar?.observacoes ?? "");
  const [itens, setItens] = useState<ItemOrcamento[]>(
    orcamentoParaEditar?.itens?.length ? orcamentoParaEditar.itens : [{ id: gerarId(), quantidade: 1, descricao: "", valorUnitario: 0 }]
  );
  const [showPreview, setShowPreview] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [valorTotal, setValorTotal] = useState<number>(orcamentoParaEditar?.valorTotal ?? 0);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (orcamentoParaEditar) {
      toast({ title: "Orçamento reaberto", description: `Dados de "${orcamentoParaEditar.clienteNome || orcamentoParaEditar.clienteNomePessoa || "cliente"}" carregados.` });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pdfRef = useRef<HTMLDivElement>(null);
  const nomeExibicao = tipoPessoa === "fisica" ? clienteNomePessoa : clienteNome;

  const dados: DadosOrcamento = {
    numero: "", data: hoje(), clienteNome, clienteCnpj, clienteEndereco,
    clienteCpf, clienteNomePessoa, clienteEmail, clienteTelefone,
    tipoPessoa, marcaMaquina, modeloMaquina, itens, observacoes, total: valorTotal,
  };

  const addItem = () => setItens((p) => [...p, { id: gerarId(), quantidade: 1, descricao: "", valorUnitario: 0 }]);
  const removeItem = (id: string) => { if (itens.length > 1) setItens((p) => p.filter((i) => i.id !== id)); };
  const updateItem = (id: string, field: keyof ItemOrcamento, value: string | number) => {
    setItens((p) => p.map((i) => i.id === id ? { ...i, [field]: value } : i));
  };

  const salvar = async () => {
    setSalvando(true);
    try {
      const id = await salvarOrcamento(dados, valorTotal);
      if (id) toast({ title: "Salvo!", description: "Orçamento salvo no histórico." });
      else toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally { setSalvando(false); }
  };

  const gerarPDF = async () => {
    if (!pdfRef.current) return;
    setShowPreview(true);
    setGerando(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const nome = sanitizeFileName(nomeExibicao || "SemNome");
      pdf.save(`Orcamento_${nome}_${hoje().replace(/\//g, "-")}.pdf`);
    } finally { setGerando(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader titulo="Novo Orçamento">
        <Link to="/historico">
          <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-[hsl(var(--brand-black))] text-xs px-2 sm:px-3">
            <History size={14} className="mr-1" /> <span className="hidden sm:inline">Histórico</span>
          </Button>
        </Link>
      </PageHeader>

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 py-6 space-y-4">
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="bg-primary px-4 py-2.5">
            <h2 className="text-primary-foreground font-bold text-sm">Novo Orçamento Comercial</h2>
          </div>

          <div className="p-4 space-y-5">
            {/* Tipo Pessoa */}
            <div>
              <h3 className="text-primary font-bold text-xs mb-2 uppercase tracking-wide border-b border-border pb-1.5">Tipo de Cliente</h3>
              <div className="flex gap-2">
                <Button type="button" variant={tipoPessoa === "juridica" ? "default" : "outline"} size="sm" onClick={() => setTipoPessoa("juridica")} className={`text-xs ${tipoPessoa === "juridica" ? "bg-primary text-primary-foreground" : "border-primary text-primary"}`}>Pessoa Jurídica</Button>
                <Button type="button" variant={tipoPessoa === "fisica" ? "default" : "outline"} size="sm" onClick={() => setTipoPessoa("fisica")} className={`text-xs ${tipoPessoa === "fisica" ? "bg-primary text-primary-foreground" : "border-primary text-primary"}`}>Pessoa Física</Button>
              </div>
            </div>

            {/* Client Data */}
            <div>
              <h3 className="text-primary font-bold text-xs mb-2 uppercase tracking-wide border-b border-border pb-1.5">Dados do Cliente</h3>
              <div className="grid grid-cols-1 gap-3">
                {tipoPessoa === "juridica" ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Empresa ({clienteNome.length}/{LIMITS.nome})</Label>
                      <Input placeholder="Nome da empresa" value={clienteNome} maxLength={LIMITS.nome} onChange={(e) => setClienteNome(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">CNPJ</Label>
                      <Input placeholder="00.000.000/0000-00" value={clienteCnpj} onChange={(e) => setClienteCnpj(maskCNPJ(e.target.value))} className="h-9 text-sm" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Nome ({clienteNomePessoa.length}/{LIMITS.nome})</Label>
                      <Input placeholder="Nome completo" value={clienteNomePessoa} maxLength={LIMITS.nome} onChange={(e) => setClienteNomePessoa(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">CPF</Label>
                      <Input placeholder="000.000.000-00" value={clienteCpf} onChange={(e) => setClienteCpf(maskCPF(e.target.value))} className="h-9 text-sm" />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Endereço ({clienteEndereco.length}/{LIMITS.endereco})</Label>
                  <Input placeholder="Rua, número, bairro, cidade" value={clienteEndereco} maxLength={LIMITS.endereco} onChange={(e) => setClienteEndereco(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Email (opcional)</Label>
                    <Input type="email" placeholder="email@exemplo.com" value={clienteEmail} maxLength={80} onChange={(e) => setClienteEmail(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Telefone (opcional)</Label>
                    <Input placeholder="(11) 99999-9999" value={clienteTelefone} onChange={(e) => setClienteTelefone(maskTelefone(e.target.value))} className="h-9 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Marca da Máquina (opcional)</Label>
                    <Input placeholder="Ex: Caterpillar" value={marcaMaquina} maxLength={40} onChange={(e) => setMarcaMaquina(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Modelo (opcional)</Label>
                    <Input placeholder="Ex: 320D" value={modeloMaquina} maxLength={40} onChange={(e) => setModeloMaquina(e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-primary font-bold text-xs mb-2 uppercase tracking-wide border-b border-border pb-1.5">Itens do Orçamento</h3>
              <div className="space-y-2">
                {itens.map((item, idx) => (
                  <div key={item.id} className={`p-2.5 rounded ${idx % 2 === 0 ? "bg-card" : "bg-[hsl(var(--table-row-alt))]"}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground">Item {idx + 1}</span>
                        <button onClick={() => removeItem(item.id)} disabled={itens.length === 1} className="text-destructive hover:text-destructive/80 disabled:opacity-30 transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <Input placeholder="Descrição do serviço/produto" value={item.descricao} maxLength={LIMITS.descricao} onChange={(e) => updateItem(item.id, "descricao", e.target.value)} className="h-8 text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Qtd</Label>
                          <Input type="number" min={1} value={item.quantidade} onChange={(e) => updateItem(item.id, "quantidade", parseInt(e.target.value) || 1)} className="h-8 text-sm" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">V. Unit. (opcional)</Label>
                          <Input type="number" min={0} step={0.01} placeholder="Opcional" value={item.valorUnitario === 0 ? "" : item.valorUnitario} onChange={(e) => updateItem(item.id, "valorUnitario", parseFloat(e.target.value) || 0)} className="h-8 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addItem} className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">
                <Plus size={13} className="mr-1" /> Adicionar Item
              </Button>

              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2">
                <Label className="text-xs font-bold text-foreground">Valor Total (R$):</Label>
                <Input type="number" min={0} step={0.01} placeholder="0,00" value={valorTotal === 0 ? "" : valorTotal} onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)} className="w-full sm:w-48 h-9 text-base font-bold" />
              </div>
            </div>

            {/* Observações */}
            <div>
              <h3 className="text-primary font-bold text-xs mb-2 uppercase tracking-wide border-b border-border pb-1.5">
                Observações (opcional) <span className="text-[10px] font-normal normal-case">({observacoes.length}/{LIMITS.observacoes})</span>
              </h3>
              <Textarea placeholder="Informações complementares..." value={observacoes} maxLength={LIMITS.observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="resize-none text-sm" />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => setShowPreview(!showPreview)} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm w-full sm:w-auto">
                <Eye size={15} className="mr-2" /> {showPreview ? "Ocultar Preview" : "Visualizar Orçamento"}
              </Button>
              <div className="flex gap-2">
                <Button onClick={salvar} disabled={salvando} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-sm flex-1 sm:flex-none">
                  <History size={15} className="mr-2" /> {salvando ? "Salvando..." : "Salvar"}
                </Button>
                <Button onClick={gerarPDF} disabled={gerando} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex-1 sm:flex-none">
                  <FileDown size={15} className="mr-2" /> {gerando ? "Gerando..." : "Baixar PDF"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="bg-primary px-4 py-2.5">
              <h2 className="text-primary-foreground font-bold text-sm">Preview do Orçamento</h2>
            </div>
            <div className="p-3 overflow-x-auto bg-gray-100">
              <div className="shadow-xl inline-block">
                <OrcamentoPDF ref={pdfRef} dados={dados} />
              </div>
            </div>
          </div>
        )}

        {!showPreview && (
          <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none", opacity: 0 }}>
            <OrcamentoPDF ref={pdfRef} dados={dados} />
          </div>
        )}
      </main>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
