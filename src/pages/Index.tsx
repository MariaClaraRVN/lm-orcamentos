import { useState, useRef } from "react";
import { Plus, Trash2, FileDown, Eye, History } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OrcamentoPDF, { ItemOrcamento, DadosOrcamento } from "@/components/OrcamentoPDF";
import { salvarOrcamento } from "@/hooks/useOrcamentos";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatMoeda = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const gerarId = () => Math.random().toString(36).substring(2, 9);

const hoje = () => {
  const d = new Date();
  return d.toLocaleDateString("pt-BR");
};

export default function Index() {
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCnpj, setClienteCnpj] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemOrcamento[]>([
    { id: gerarId(), quantidade: 1, descricao: "", valorUnitario: 0 },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [gerando, setGerando] = useState(false);

  const pdfRef = useRef<HTMLDivElement>(null);

  const dados: DadosOrcamento = {
    numero: "001",
    data: hoje(),
    clienteNome,
    clienteCnpj,
    clienteEndereco,
    itens,
    observacoes,
  };

  const total = itens.reduce(
    (acc, item) => acc + item.quantidade * item.valorUnitario,
    0
  );

  const addItem = () => {
    setItens((prev) => [
      ...prev,
      { id: gerarId(), quantidade: 1, descricao: "", valorUnitario: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (itens.length === 1) return;
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (
    id: string,
    field: keyof ItemOrcamento,
    value: string | number
  ) => {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const gerarPDF = async () => {
    if (!pdfRef.current) return;
    setShowPreview(true);
    setGerando(true);

    // Wait for the preview to render
    await new Promise((r) => setTimeout(r, 500));

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`orcamento_lm_${Date.now()}.pdf`);

      // Save to database
      await salvarOrcamento(dados, total);
      toast({
        title: "Orçamento salvo!",
        description: "O orçamento foi salvo no histórico com sucesso.",
      });
    } finally {
      setGerando(false);
    }
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">Sistema de Orçamentos</span>
            <Link to="/historico">
              <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-black">
                <History size={14} className="mr-1" />
                Histórico
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Form Section */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {/* Section Title */}
          <div className="bg-primary px-6 py-3">
            <h2 className="text-primary-foreground font-bold text-base">Novo Orçamento Comercial</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Client Data */}
            <div>
              <h3 className="text-primary font-bold text-sm mb-3 uppercase tracking-wide border-b border-border pb-2">
                Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="empresa" className="text-xs font-semibold text-muted-foreground uppercase">Empresa</Label>
                  <Input
                    id="empresa"
                    placeholder="Nome da empresa"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="border-input focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cnpj" className="text-xs font-semibold text-muted-foreground uppercase">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={clienteCnpj}
                    onChange={(e) => setClienteCnpj(e.target.value)}
                    className="border-input focus-visible:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="endereco" className="text-xs font-semibold text-muted-foreground uppercase">Endereço (opcional)</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro, cidade"
                    value={clienteEndereco}
                    onChange={(e) => setClienteEndereco(e.target.value)}
                    className="border-input focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-primary font-bold text-sm mb-3 uppercase tracking-wide border-b border-border pb-2">
                Itens do Orçamento
              </h3>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 mb-2 px-2">
                <span className="col-span-2 text-xs font-bold text-muted-foreground uppercase">Qtd</span>
                <span className="col-span-6 text-xs font-bold text-muted-foreground uppercase">Descrição</span>
                <span className="col-span-3 text-xs font-bold text-muted-foreground uppercase">Valor Unit.</span>
                <span className="col-span-1"></span>
              </div>

              <div className="space-y-2">
                {itens.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 gap-2 p-2 rounded ${idx % 2 === 0 ? "bg-card" : "bg-[hsl(var(--table-row-alt))]"}`}
                  >
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) =>
                          updateItem(item.id, "quantidade", parseInt(e.target.value) || 1)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder="Descrição do serviço/produto"
                        value={item.descricao}
                        onChange={(e) =>
                          updateItem(item.id, "descricao", e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0,00"
                        value={item.valorUnitario === 0 ? "" : item.valorUnitario}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "valorUnitario",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={itens.length === 1}
                        className="text-destructive hover:text-destructive/80 disabled:opacity-30 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                className="mt-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Plus size={14} className="mr-1" />
                Adicionar Item
              </Button>

              {/* Total */}
              <div className="mt-4 flex justify-end">
                <div className="bg-[hsl(var(--brand-black))] text-white px-6 py-2 rounded font-bold text-lg">
                  Total: {formatMoeda(total)}
                </div>
              </div>
            </div>

            {/* Observations */}
            <div>
              <h3 className="text-primary font-bold text-sm mb-3 uppercase tracking-wide border-b border-border pb-2">
                Observações Adicionais (opcional)
              </h3>
              <Textarea
                placeholder="Informações complementares..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Eye size={16} className="mr-2" />
                {showPreview ? "Ocultar Preview" : "Visualizar Orçamento"}
              </Button>
              <Button
                onClick={gerarPDF}
                disabled={gerando}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                <FileDown size={16} className="mr-2" />
                {gerando ? "Gerando PDF..." : "Baixar PDF"}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
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
        )}

        {/* Hidden PDF render (always mounted for pdf generation) */}
        {!showPreview && (
          <div
            style={{
              position: "fixed",
              left: "-9999px",
              top: 0,
              pointerEvents: "none",
              opacity: 0,
            }}
          >
            <OrcamentoPDF ref={pdfRef} dados={dados} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-[hsl(var(--brand-black))] text-gray-400 text-xs text-center py-4">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Orçamentos
      </footer>
    </div>
  );
}
