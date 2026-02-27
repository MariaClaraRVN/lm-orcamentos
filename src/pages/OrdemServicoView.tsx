import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, FileDown, Save, Camera, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import {
  buscarOrdemServico, buscarDiagnostico, buscarConclusao,
  listarMidias, salvarDiagnostico, salvarConclusao,
  atualizarDiagnostico, atualizarConclusao, uploadMidia,
  OrdemServico, Diagnostico, Conclusao, MidiaOS,
} from "@/hooks/useOrdensServico";
import PageHeader from "@/components/PageHeader";
import OSRetiradaPDF from "@/components/OSRetiradaPDF";
import OSDiagnosticoPDF from "@/components/OSDiagnosticoPDF";
import OSConclusaoPDF from "@/components/OSConclusaoPDF";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatMoeda = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function OrdemServicoView() {
  const { id } = useParams<{ id: string }>();
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [conclusao, setConclusao] = useState<Conclusao | null>(null);
  const [midias, setMidias] = useState<MidiaOS[]>([]);
  const [loading, setLoading] = useState(true);

  // PDF refs
  const retiradaPdfRef = useRef<HTMLDivElement>(null);
  const diagnosticoPdfRef = useRef<HTMLDivElement>(null);
  const conclusaoPdfRef = useRef<HTMLDivElement>(null);
  const [gerandoRetirada, setGerandoRetirada] = useState(false);
  const [gerandoDiagnostico, setGerandoDiagnostico] = useState(false);
  const [gerandoConclusao, setGerandoConclusao] = useState(false);

  // Upload refs
  const diagFileRef = useRef<HTMLInputElement>(null);
  const concFileRef = useRef<HTMLInputElement>(null);
  const [uploadingDiag, setUploadingDiag] = useState(false);
  const [uploadingConc, setUploadingConc] = useState(false);

  // Edit modes
  const [editingDiag, setEditingDiag] = useState(false);
  const [editingConc, setEditingConc] = useState(false);

  // Diagnóstico form
  const [tecnico, setTecnico] = useState("");
  const [dataTeste, setDataTeste] = useState("");
  const [problemaIdentificado, setProblemaIdentificado] = useState("");
  const [pecasDanificadas, setPecasDanificadas] = useState("");
  const [causaProvavel, setCausaProvavel] = useState("");
  const [testesRealizados, setTestesRealizados] = useState("");
  const [resultadoFinal, setResultadoFinal] = useState("");
  const [obsDiagnostico, setObsDiagnostico] = useState("");

  // Conclusão form
  const [servicosExecutados, setServicosExecutados] = useState("");
  const [pecasSubstituidas, setPecasSubstituidas] = useState("");
  const [valorFinal, setValorFinal] = useState(0);
  const [dataConclusao, setDataConclusao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [garantiaMeses, setGarantiaMeses] = useState(0);
  const [obsFinais, setObsFinais] = useState("");

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      buscarOrdemServico(id), buscarDiagnostico(id), buscarConclusao(id), listarMidias(id),
    ]).then(([osData, diagData, concData, midiasData]) => {
      setOs(osData); setDiagnostico(diagData); setConclusao(concData); setMidias(midiasData);
      setLoading(false);
    });
  }, [id]);

  const populateDiagForm = (d: Diagnostico) => {
    setTecnico(d.tecnico_responsavel); setDataTeste(d.data_teste);
    setProblemaIdentificado(d.problema_identificado); setPecasDanificadas(d.pecas_danificadas);
    setCausaProvavel(d.causa_provavel); setTestesRealizados(d.testes_realizados);
    setResultadoFinal(d.resultado_final); setObsDiagnostico(d.observacoes);
  };

  const populateConcForm = (c: Conclusao) => {
    setServicosExecutados(c.servicos_executados); setPecasSubstituidas(c.pecas_substituidas);
    setValorFinal(c.valor_final); setDataConclusao(c.data_conclusao);
    setDataEntrega(c.data_entrega); setGarantiaMeses(c.garantia_meses);
    setObsFinais(c.observacoes_finais);
  };

  const getNome = (o: OrdemServico) =>
    (o.tipo_pessoa === "fisica" ? o.cliente_nome_pessoa : o.cliente_nome) || "Cliente";

  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9À-ÿ ]/g, "").replace(/\s+/g, "_");

  const gerarPDF = async (ref: React.RefObject<HTMLDivElement | null>, nome_arquivo: string, setGerando: (v: boolean) => void) => {
    if (!ref.current || !os) return;
    setGerando(true);
    await new Promise((r) => setTimeout(r, 300));
    try {
      const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      pdf.save(`${nome_arquivo}_${sanitize(getNome(os))}_${os.numero}.pdf`);
    } finally { setGerando(false); }
  };

  const handleSalvarDiagnostico = async () => {
    if (!id) return;
    setSalvando(true);
    try {
      if (diagnostico && editingDiag) {
        const ok = await atualizarDiagnostico(diagnostico.id, {
          tecnico_responsavel: tecnico, data_teste: dataTeste,
          problema_identificado: problemaIdentificado, pecas_danificadas: pecasDanificadas,
          causa_provavel: causaProvavel, testes_realizados: testesRealizados,
          resultado_final: resultadoFinal, observacoes: obsDiagnostico,
        });
        if (ok) {
          const diag = await buscarDiagnostico(id);
          setDiagnostico(diag); setEditingDiag(false);
          toast({ title: "Diagnóstico atualizado!" });
        } else {
          toast({ title: "Erro", variant: "destructive" });
        }
      } else {
        const diagId = await salvarDiagnostico({
          os_id: id, tecnico_responsavel: tecnico, data_teste: dataTeste,
          problema_identificado: problemaIdentificado, pecas_danificadas: pecasDanificadas,
          causa_provavel: causaProvavel, testes_realizados: testesRealizados,
          resultado_final: resultadoFinal, observacoes: obsDiagnostico,
        });
        if (diagId) {
          const diag = await buscarDiagnostico(id);
          setDiagnostico(diag);
          toast({ title: "Diagnóstico salvo!" });
        } else {
          toast({ title: "Erro", variant: "destructive" });
        }
      }
    } finally { setSalvando(false); }
  };

  const handleSalvarConclusao = async () => {
    if (!id) return;
    setSalvando(true);
    try {
      if (conclusao && editingConc) {
        const ok = await atualizarConclusao(conclusao.id, {
          servicos_executados: servicosExecutados, pecas_substituidas: pecasSubstituidas,
          valor_final: valorFinal, data_conclusao: dataConclusao,
          data_entrega: dataEntrega, garantia_meses: garantiaMeses,
          observacoes_finais: obsFinais,
        });
        if (ok) {
          const conc = await buscarConclusao(id);
          setConclusao(conc); setEditingConc(false);
          toast({ title: "Conclusão atualizada!" });
        } else {
          toast({ title: "Erro", variant: "destructive" });
        }
      } else {
        const concId = await salvarConclusao({
          os_id: id, servicos_executados: servicosExecutados,
          pecas_substituidas: pecasSubstituidas, valor_final: valorFinal,
          data_conclusao: dataConclusao, data_entrega: dataEntrega,
          garantia_meses: garantiaMeses, observacoes_finais: obsFinais,
        });
        if (concId) {
          const conc = await buscarConclusao(id);
          setConclusao(conc);
          toast({ title: "Conclusão salva!" });
        } else {
          toast({ title: "Erro", variant: "destructive" });
        }
      }
    } finally { setSalvando(false); }
  };

  const handleUploadMidia = async (etapa: string, files: FileList | null, setUploading: (v: boolean) => void, inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (!id || !files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const midia = await uploadMidia(id, etapa, file);
      if (midia) setMidias((prev) => [...prev, midia]);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground">Carregando...</span></div>;
  if (!os) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-muted-foreground text-base">OS não encontrada.</p>
      <Link to="/os/historico"><Button variant="outline">Voltar ao Histórico</Button></Link>
    </div>
  );

  const midiasRetirada = midias.filter((m) => m.etapa === "retirada");
  const midiasDiagnostico = midias.filter((m) => m.etapa === "diagnostico");
  const midiasConclusao = midias.filter((m) => m.etapa === "conclusao");

  const showDiagForm = !diagnostico || editingDiag;
  const showConcForm = !conclusao || editingConc;

  const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    value ? <div className="flex flex-col sm:flex-row sm:gap-2 py-0.5"><span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase min-w-[120px]">{label}:</span><span className="text-xs sm:text-sm text-foreground">{value}</span></div> : null
  );

  const GaleriaMidias = ({ items }: { items: MidiaOS[] }) => items.length === 0 ? null : (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((m) => (
        <div key={m.id} className="relative">
          {m.tipo === "foto" ? (
            <img src={m.url} alt={m.descricao || "Mídia"} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border border-border" />
          ) : (
            <video src={m.url} controls className="w-28 h-20 sm:w-32 sm:h-24 rounded border border-border" />
          )}
        </div>
      ))}
    </div>
  );

  const UploadButton = ({ etapa, uploading, setUploading, inputRef }: { etapa: string; uploading: boolean; setUploading: (v: boolean) => void; inputRef: React.RefObject<HTMLInputElement | null> }) => (
    <div className="mt-2">
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleUploadMidia(etapa, e.target.files, setUploading, inputRef)} />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">
        <Camera size={13} className="mr-1" /> {uploading ? "Enviando..." : "Adicionar Fotos"}
      </Button>
    </div>
  );

  const DiagForm = () => (
    <div className="space-y-4">
      {!diagnostico && <p className="text-xs text-muted-foreground mb-2">Diagnóstico ainda não registrado. Preencha abaixo:</p>}
      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Técnico Responsável</Label>
            <Input placeholder="Nome do técnico" value={tecnico} maxLength={40} onChange={(e) => setTecnico(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Data do Teste</Label>
            <Input type="date" value={dataTeste} onChange={(e) => setDataTeste(e.target.value)} className="h-9 text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Problema Identificado</Label>
          <Textarea placeholder="Descreva o problema..." value={problemaIdentificado} maxLength={500} onChange={(e) => setProblemaIdentificado(e.target.value)} rows={3} className="resize-none text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Peças Danificadas</Label>
            <Textarea placeholder="Liste as peças..." value={pecasDanificadas} maxLength={500} onChange={(e) => setPecasDanificadas(e.target.value)} rows={2} className="resize-none text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Causa Provável</Label>
            <Textarea placeholder="Causa provável..." value={causaProvavel} maxLength={500} onChange={(e) => setCausaProvavel(e.target.value)} rows={2} className="resize-none text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Testes Realizados</Label>
          <Textarea placeholder="Descreva os testes..." value={testesRealizados} maxLength={500} onChange={(e) => setTestesRealizados(e.target.value)} rows={3} className="resize-none text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Resultado Final</Label>
          <Textarea placeholder="Resultado dos testes..." value={resultadoFinal} maxLength={500} onChange={(e) => setResultadoFinal(e.target.value)} rows={2} className="resize-none text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Observações</Label>
          <Textarea placeholder="Observações adicionais..." value={obsDiagnostico} maxLength={500} onChange={(e) => setObsDiagnostico(e.target.value)} rows={2} className="resize-none text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSalvarDiagnostico} disabled={salvando} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm">
          <Save size={15} className="mr-2" /> {salvando ? "Salvando..." : editingDiag ? "Atualizar Diagnóstico" : "Salvar Diagnóstico"}
        </Button>
        {editingDiag && (
          <Button variant="outline" onClick={() => setEditingDiag(false)} className="text-sm">
            <X size={15} className="mr-1" /> Cancelar
          </Button>
        )}
      </div>
    </div>
  );

  const ConcForm = () => (
    <div className="space-y-4">
      {!conclusao && <p className="text-xs text-muted-foreground mb-2">Conclusão ainda não registrada. Preencha abaixo:</p>}
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Serviços Executados</Label>
          <Textarea placeholder="Descreva os serviços..." value={servicosExecutados} maxLength={500} onChange={(e) => setServicosExecutados(e.target.value)} rows={3} className="resize-none text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Peças Substituídas</Label>
          <Textarea placeholder="Liste as peças..." value={pecasSubstituidas} maxLength={500} onChange={(e) => setPecasSubstituidas(e.target.value)} rows={2} className="resize-none text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Valor Final (R$)</Label>
            <Input type="number" min={0} step={0.01} placeholder="0,00" value={valorFinal === 0 ? "" : valorFinal} onChange={(e) => setValorFinal(parseFloat(e.target.value) || 0)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Garantia (meses)</Label>
            <Input type="number" min={0} placeholder="0" value={garantiaMeses === 0 ? "" : garantiaMeses} onChange={(e) => setGarantiaMeses(parseInt(e.target.value) || 0)} className="h-9 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Data Conclusão</Label>
            <Input type="date" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Data Entrega</Label>
            <Input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} className="h-9 text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Observações Finais</Label>
          <Textarea placeholder="Observações..." value={obsFinais} maxLength={500} onChange={(e) => setObsFinais(e.target.value)} rows={3} className="resize-none text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSalvarConclusao} disabled={salvando} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm">
          <Save size={15} className="mr-2" /> {salvando ? "Finalizando..." : editingConc ? "Atualizar Conclusão" : "Salvar Conclusão"}
        </Button>
        {editingConc && (
          <Button variant="outline" onClick={() => setEditingConc(false)} className="text-sm">
            <X size={15} className="mr-1" /> Cancelar
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader titulo="Visualização de OS">
        <Link to="/os/historico">
          <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-[hsl(var(--brand-black))] text-xs px-2 sm:px-3">
            <ArrowLeft size={14} className="mr-1" /> Histórico
          </Button>
        </Link>
      </PageHeader>

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 py-6 space-y-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">
            {os.numero} <span className="text-primary">— {getNome(os)}</span>
          </h1>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => gerarPDF(retiradaPdfRef, "Relatorio_Retirada", setGerandoRetirada)} disabled={gerandoRetirada} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
              <FileDown size={13} className="mr-1" /> {gerandoRetirada ? "Gerando..." : "PDF Retirada"}
            </Button>
            {diagnostico && (
              <Button size="sm" onClick={() => gerarPDF(diagnosticoPdfRef, "Relatorio_Diagnostico", setGerandoDiagnostico)} disabled={gerandoDiagnostico} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">
                <FileDown size={13} className="mr-1" /> {gerandoDiagnostico ? "Gerando..." : "PDF Diagnóstico"}
              </Button>
            )}
            {conclusao && (
              <Button size="sm" onClick={() => gerarPDF(conclusaoPdfRef, "Relatorio_Conclusao", setGerandoConclusao)} disabled={gerandoConclusao} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">
                <FileDown size={13} className="mr-1" /> {gerandoConclusao ? "Gerando..." : "PDF Conclusão"}
              </Button>
            )}
          </div>
        </div>

        {os.data_limite_abandono && new Date(os.data_limite_abandono) < new Date() && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="text-destructive shrink-0" size={18} />
            <div>
              <p className="text-xs font-semibold text-destructive">Prazo de 90 dias expirado</p>
              <p className="text-[10px] text-muted-foreground">Limite: {new Date(os.data_limite_abandono).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        )}

        <Accordion type="multiple" defaultValue={["retirada", "diagnostico", "conclusao"]} className="space-y-3">
          {/* RETIRADA */}
          <AccordionItem value="retirada" className="bg-card rounded-lg border border-border">
            <AccordionTrigger className="px-4 sm:px-6 py-3 hover:no-underline">
              <span className="font-bold text-primary text-sm">📄 Relatório de Retirada</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-4 space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Dados do Cliente</h4>
              <InfoRow label="Nome" value={getNome(os)} />
              <InfoRow label={os.tipo_pessoa === "juridica" ? "CNPJ" : "CPF"} value={os.tipo_pessoa === "juridica" ? os.cliente_cnpj : os.cliente_cpf} />
              <InfoRow label="Endereço" value={os.cliente_endereco} />
              <InfoRow label="Email" value={os.cliente_email} />
              <InfoRow label="Telefone" value={os.cliente_telefone} />

              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mt-3">Dados da Máquina</h4>
              <InfoRow label="Tipo" value={os.tipo_maquina === "gerador" ? "Gerador" : "Compressor"} />
              <InfoRow label="Marca" value={os.marca} />
              <InfoRow label="Modelo" value={os.modelo} />
              <InfoRow label="Acessórios" value={os.acessorios_entregues} />

              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mt-3">Dados da Retirada</h4>
              <InfoRow label="Data" value={os.data_retirada} />
              <InfoRow label="Local" value={os.local_coleta} />
              <InfoRow label="Responsável" value={os.responsavel_retirada} />
              <InfoRow label="Defeito" value={os.defeito_relatado} />
              <GaleriaMidias items={midiasRetirada} />
              {os.clausula_permanencia && (
                <div className="mt-3 p-2 bg-muted rounded text-[10px] sm:text-xs text-muted-foreground italic">
                  <strong>Cláusula de Permanência:</strong> {os.clausula_permanencia}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* DIAGNÓSTICO */}
          <AccordionItem value="diagnostico" className="bg-card rounded-lg border border-border">
            <AccordionTrigger className="px-4 sm:px-6 py-3 hover:no-underline">
              <span className="font-bold text-primary text-sm">🔍 Diagnóstico / Teste</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-4 space-y-2">
              {showDiagForm ? (
                <DiagForm />
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { populateDiagForm(diagnostico!); setEditingDiag(true); }} className="text-xs text-primary">
                      <Pencil size={13} className="mr-1" /> Editar
                    </Button>
                  </div>
                  <InfoRow label="Técnico" value={diagnostico!.tecnico_responsavel} />
                  <InfoRow label="Data" value={diagnostico!.data_teste} />
                  <InfoRow label="Problema" value={diagnostico!.problema_identificado} />
                  <InfoRow label="Peças" value={diagnostico!.pecas_danificadas} />
                  <InfoRow label="Causa" value={diagnostico!.causa_provavel} />
                  <InfoRow label="Testes" value={diagnostico!.testes_realizados} />
                  <InfoRow label="Resultado" value={diagnostico!.resultado_final} />
                  <InfoRow label="Obs." value={diagnostico!.observacoes} />
                </>
              )}
              <GaleriaMidias items={midiasDiagnostico} />
              <UploadButton etapa="diagnostico" uploading={uploadingDiag} setUploading={setUploadingDiag} inputRef={diagFileRef} />
            </AccordionContent>
          </AccordionItem>

          {/* CONCLUSÃO */}
          <AccordionItem value="conclusao" className="bg-card rounded-lg border border-border">
            <AccordionTrigger className="px-4 sm:px-6 py-3 hover:no-underline">
              <span className="font-bold text-primary text-sm">✅ Conclusão / Entrega</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 sm:px-6 pb-4 space-y-2">
              {showConcForm ? (
                <ConcForm />
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { populateConcForm(conclusao!); setEditingConc(true); }} className="text-xs text-primary">
                      <Pencil size={13} className="mr-1" /> Editar
                    </Button>
                  </div>
                  <InfoRow label="Serviços" value={conclusao!.servicos_executados} />
                  <InfoRow label="Peças" value={conclusao!.pecas_substituidas} />
                  <InfoRow label="Valor" value={formatMoeda(conclusao!.valor_final)} />
                  <InfoRow label="Conclusão" value={conclusao!.data_conclusao} />
                  <InfoRow label="Entrega" value={conclusao!.data_entrega} />
                  <InfoRow label="Garantia" value={`${conclusao!.garantia_meses} meses`} />
                  <InfoRow label="Obs." value={conclusao!.observacoes_finais} />
                </>
              )}
              <GaleriaMidias items={midiasConclusao} />
              <UploadButton etapa="conclusao" uploading={uploadingConc} setUploading={setUploadingConc} inputRef={concFileRef} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      {/* Hidden PDF renders */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none", opacity: 0 }}>
        <OSRetiradaPDF ref={retiradaPdfRef} os={os} midias={midias} />
        {diagnostico && <OSDiagnosticoPDF ref={diagnosticoPdfRef} os={os} diagnostico={diagnostico} midias={midias} />}
        {conclusao && <OSConclusaoPDF ref={conclusaoPdfRef} os={os} conclusao={conclusao} midias={midias} />}
      </div>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}