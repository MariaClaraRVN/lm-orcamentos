import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Save, Camera, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  criarOrdemServico, salvarDiagnostico, salvarConclusao,
  atualizarStatusOS, uploadMidia, MidiaOS,
} from "@/hooks/useOrdensServico";
import PageHeader from "@/components/PageHeader";

const maskCNPJ = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 14);
  return digits.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
};
const maskCPF = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  return digits.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
};
const maskTelefone = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const CLAUSULA_PADRAO = "Após 90 dias sem aprovação de orçamento ou manifestação formal do cliente, e mediante notificação registrada, o equipamento poderá ser considerado abandonado, podendo ser aplicadas as disposições legais vigentes.";

export default function OrdemServicoNova() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("retirada");
  const [osId, setOsId] = useState<string | null>(null);

  // Cliente
  const [tipoPessoa, setTipoPessoa] = useState<"juridica" | "fisica">("juridica");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCnpj, setClienteCnpj] = useState("");
  const [clienteCpf, setClienteCpf] = useState("");
  const [clienteNomePessoa, setClienteNomePessoa] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");

  // Máquina
  const [tipoMaquina, setTipoMaquina] = useState("gerador");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [horimetro, setHorimetro] = useState("");
  const [potencia, setPotencia] = useState("");
  const [tensao, setTensao] = useState("");
  const [estadoGeral, setEstadoGeral] = useState("");
  const [acessorios, setAcessorios] = useState("");

  // Retirada
  const [dataRetirada, setDataRetirada] = useState("");
  const [horaRetirada, setHoraRetirada] = useState("");
  const [localColeta, setLocalColeta] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [defeitoRelatado, setDefeitoRelatado] = useState("");
  const [clausula, setClausula] = useState(CLAUSULA_PADRAO);

  const [midiasRetirada, setMidiasRetirada] = useState<MidiaOS[]>([]);
  const [uploading, setUploading] = useState(false);

  // Diagnóstico
  const [tecnico, setTecnico] = useState("");
  const [dataTeste, setDataTeste] = useState("");
  const [problemaIdentificado, setProblemaIdentificado] = useState("");
  const [pecasDanificadas, setPecasDanificadas] = useState("");
  const [causaProvavel, setCausaProvavel] = useState("");
  const [testesRealizados, setTestesRealizados] = useState("");
  const [resultadoFinal, setResultadoFinal] = useState("");
  const [obsDiagnostico, setObsDiagnostico] = useState("");

  // Conclusão
  const [servicosExecutados, setServicosExecutados] = useState("");
  const [pecasSubstituidas, setPecasSubstituidas] = useState("");
  const [valorFinal, setValorFinal] = useState(0);
  const [dataConclusao, setDataConclusao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [garantiaMeses, setGarantiaMeses] = useState(0);
  const [obsFinais, setObsFinais] = useState("");

  const [salvando, setSalvando] = useState(false);

  const handleSalvarOS = async () => {
    setSalvando(true);
    try {
      const id = await criarOrdemServico({
        cliente_nome: clienteNome, cliente_cnpj: clienteCnpj, cliente_cpf: clienteCpf,
        cliente_nome_pessoa: clienteNomePessoa, cliente_email: clienteEmail,
        cliente_telefone: clienteTelefone, cliente_endereco: clienteEndereco,
        tipo_pessoa: tipoPessoa, tipo_maquina: tipoMaquina,
        marca, modelo, numero_serie: numeroSerie, horimetro, potencia, tensao,
        estado_geral: estadoGeral, acessorios_entregues: acessorios,
        data_retirada: dataRetirada, hora_retirada: horaRetirada,
        local_coleta: localColeta, responsavel_retirada: responsavel,
        placa_veiculo: placaVeiculo, defeito_relatado: defeitoRelatado,
        clausula_permanencia: clausula,
      });
      if (id) {
        setOsId(id);
        toast({ title: "OS criada!", description: "Prossiga para o diagnóstico." });
        setActiveTab("diagnostico");
      } else {
        toast({ title: "Erro", description: "Não foi possível criar a OS.", variant: "destructive" });
      }
    } finally { setSalvando(false); }
  };

  const handleUploadFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!osId || !e.target.files) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const midia = await uploadMidia(osId, "retirada", file);
      if (midia) setMidiasRetirada((prev) => [...prev, midia]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSalvarDiagnostico = async () => {
    if (!osId) return;
    setSalvando(true);
    try {
      const id = await salvarDiagnostico({
        os_id: osId, tecnico_responsavel: tecnico, data_teste: dataTeste,
        problema_identificado: problemaIdentificado, pecas_danificadas: pecasDanificadas,
        causa_provavel: causaProvavel, testes_realizados: testesRealizados,
        resultado_final: resultadoFinal, observacoes: obsDiagnostico,
      });
      if (id) {
        await atualizarStatusOS(osId, "aguardando_orcamento");
        toast({ title: "Diagnóstico salvo!", description: "Prossiga para a conclusão." });
        setActiveTab("conclusao");
      } else {
        toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
      }
    } finally { setSalvando(false); }
  };

  const handleFinalizarOS = async () => {
    if (!osId) return;
    setSalvando(true);
    try {
      const id = await salvarConclusao({
        os_id: osId, servicos_executados: servicosExecutados,
        pecas_substituidas: pecasSubstituidas, valor_final: valorFinal,
        data_conclusao: dataConclusao, data_entrega: dataEntrega,
        garantia_meses: garantiaMeses, observacoes_finais: obsFinais,
      });
      if (id) {
        await atualizarStatusOS(osId, "finalizado");
        toast({ title: "OS finalizada!" });
        navigate(`/os/${osId}`);
      } else {
        toast({ title: "Erro", variant: "destructive" });
      }
    } finally { setSalvando(false); }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-primary font-bold text-xs sm:text-sm mb-2 uppercase tracking-wide border-b border-border pb-1.5">{children}</h3>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader titulo="Nova Ordem de Serviço">
        <Link to="/os/historico">
          <Button variant="outline" size="sm" className="border-[hsl(var(--brand-green-light))] text-[hsl(var(--brand-green-light))] hover:bg-[hsl(var(--brand-green-light))] hover:text-[hsl(var(--brand-black))] text-xs px-2 sm:px-3">
            <History size={14} className="mr-1" /> <span className="hidden sm:inline">Histórico OS</span><span className="sm:hidden">OS</span>
          </Button>
        </Link>
      </PageHeader>

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 py-6">
        <div className="mb-4">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Nova Ordem de Serviço</h1>
          {osId && <p className="text-xs text-muted-foreground mt-1">OS criada — ID salvo</p>}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto">
            <TabsTrigger value="retirada" className="text-xs sm:text-sm py-2">1. Retirada</TabsTrigger>
            <TabsTrigger value="diagnostico" disabled={!osId} className="text-xs sm:text-sm py-2">2. Diagnóstico</TabsTrigger>
            <TabsTrigger value="conclusao" disabled={!osId} className="text-xs sm:text-sm py-2">3. Conclusão</TabsTrigger>
          </TabsList>

          {/* ETAPA 1: RETIRADA */}
          <TabsContent value="retirada">
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="bg-primary px-4 py-2.5">
                <h2 className="text-primary-foreground font-bold text-sm">Relatório de Retirada de Máquina</h2>
              </div>
              <div className="p-4 space-y-5">
                {/* Tipo Pessoa */}
                <div>
                  <SectionTitle>Tipo de Cliente</SectionTitle>
                  <div className="flex gap-2">
                    <Button type="button" variant={tipoPessoa === "juridica" ? "default" : "outline"} size="sm" onClick={() => setTipoPessoa("juridica")} className={`text-xs ${tipoPessoa === "juridica" ? "bg-primary text-primary-foreground" : "border-primary text-primary"}`}>Pessoa Jurídica</Button>
                    <Button type="button" variant={tipoPessoa === "fisica" ? "default" : "outline"} size="sm" onClick={() => setTipoPessoa("fisica")} className={`text-xs ${tipoPessoa === "fisica" ? "bg-primary text-primary-foreground" : "border-primary text-primary"}`}>Pessoa Física</Button>
                  </div>
                </div>

                {/* Cliente */}
                <div>
                  <SectionTitle>Dados do Cliente</SectionTitle>
                  <div className="grid grid-cols-1 gap-3">
                    {tipoPessoa === "juridica" ? (
                      <>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Empresa ({clienteNome.length}/40)</Label>
                          <Input placeholder="Nome da empresa" value={clienteNome} maxLength={40} onChange={(e) => setClienteNome(e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">CNPJ</Label>
                          <Input placeholder="00.000.000/0000-00" value={clienteCnpj} onChange={(e) => setClienteCnpj(maskCNPJ(e.target.value))} className="h-9 text-sm" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Nome ({clienteNomePessoa.length}/40)</Label>
                          <Input placeholder="Nome completo" value={clienteNomePessoa} maxLength={40} onChange={(e) => setClienteNomePessoa(e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-muted-foreground uppercase">CPF</Label>
                          <Input placeholder="000.000.000-00" value={clienteCpf} onChange={(e) => setClienteCpf(maskCPF(e.target.value))} className="h-9 text-sm" />
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Endereço ({clienteEndereco.length}/80)</Label>
                      <Input placeholder="Rua, número, bairro, cidade" value={clienteEndereco} maxLength={80} onChange={(e) => setClienteEndereco(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Email</Label>
                        <Input type="email" placeholder="email@exemplo.com" value={clienteEmail} maxLength={80} onChange={(e) => setClienteEmail(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Telefone</Label>
                        <Input placeholder="(11) 99999-9999" value={clienteTelefone} onChange={(e) => setClienteTelefone(maskTelefone(e.target.value))} className="h-9 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Máquina */}
                <div>
                  <SectionTitle>Dados da Máquina</SectionTitle>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Tipo</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant={tipoMaquina === "gerador" ? "default" : "outline"} size="sm" onClick={() => setTipoMaquina("gerador")} className={`text-xs ${tipoMaquina === "gerador" ? "bg-primary text-primary-foreground" : "border-primary text-primary"}`}>Gerador</Button>
                        <Button type="button" variant={tipoMaquina === "compressor" ? "default" : "outline"} size="sm" onClick={() => setTipoMaquina("compressor")} className={`text-xs ${tipoMaquina === "compressor" ? "bg-primary text-primary-foreground" : "border-primary text-primary"}`}>Compressor</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Marca</Label>
                        <Input placeholder="Ex: Caterpillar" value={marca} maxLength={40} onChange={(e) => setMarca(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Modelo</Label>
                        <Input placeholder="Ex: 320D" value={modelo} maxLength={40} onChange={(e) => setModelo(e.target.value)} className="h-9 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Horímetro</Label>
                        <Input placeholder="Horas" value={horimetro} maxLength={20} onChange={(e) => setHorimetro(e.target.value)} className="h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Tensão</Label>
                        <Input placeholder="220V / 380V" value={tensao} maxLength={20} onChange={(e) => setTensao(e.target.value)} className="h-9 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Acessórios Entregues</Label>
                      <Textarea placeholder="Liste os acessórios..." value={acessorios} maxLength={200} onChange={(e) => setAcessorios(e.target.value)} rows={2} className="resize-none text-sm" />
                    </div>
                  </div>
                </div>

                {/* Retirada */}
                <div>
                  <SectionTitle>Dados da Retirada</SectionTitle>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Data</Label>
                      <Input type="date" value={dataRetirada} onChange={(e) => setDataRetirada(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Local da Coleta ({localColeta.length}/80)</Label>
                      <Input placeholder="Endereço de coleta" value={localColeta} maxLength={80} onChange={(e) => setLocalColeta(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Responsável</Label>
                      <Input placeholder="Nome" value={responsavel} maxLength={40} onChange={(e) => setResponsavel(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold text-muted-foreground uppercase">Defeito Relatado</Label>
                      <Textarea placeholder="Descreva o defeito..." value={defeitoRelatado} maxLength={500} onChange={(e) => setDefeitoRelatado(e.target.value)} rows={3} className="resize-none text-sm" />
                    </div>
                  </div>
                </div>

                {/* Fotos */}
                {osId && (
                  <div>
                    <SectionTitle>Fotos da Retirada</SectionTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {midiasRetirada.map((m) => (
                        <div key={m.id} className="relative w-20 h-20 rounded border border-border overflow-hidden">
                          <img src={m.url} alt={m.descricao || "Foto"} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUploadFotos} />
                    <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">
                      <Camera size={13} className="mr-1" /> {uploading ? "Enviando..." : "Adicionar Fotos"}
                    </Button>
                  </div>
                )}

                {/* Cláusula */}
                <div>
                  <SectionTitle>Cláusula de Permanência</SectionTitle>
                  <Textarea value={clausula} onChange={(e) => setClausula(e.target.value)} rows={3} className="resize-none text-xs sm:text-sm" />
                </div>

                {/* Ações */}
                <div className="pt-2">
                  <Button onClick={handleSalvarOS} disabled={salvando || !!osId} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm w-full sm:w-auto">
                    <Save size={15} className="mr-2" />
                    {salvando ? "Salvando..." : osId ? "OS Salva ✓" : "Salvar OS"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ETAPA 2: DIAGNÓSTICO */}
          <TabsContent value="diagnostico">
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="bg-primary px-4 py-2.5">
                <h2 className="text-primary-foreground font-bold text-sm">Relatório de Diagnóstico / Teste</h2>
              </div>
              <div className="p-4 space-y-4">
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
                <div className="pt-2">
                  <Button onClick={handleSalvarDiagnostico} disabled={salvando} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm w-full sm:w-auto">
                    <Save size={15} className="mr-2" /> {salvando ? "Salvando..." : "Salvar Diagnóstico"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ETAPA 3: CONCLUSÃO */}
          <TabsContent value="conclusao">
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="bg-primary px-4 py-2.5">
                <h2 className="text-primary-foreground font-bold text-sm">Relatório de Conclusão / Entrega</h2>
              </div>
              <div className="p-4 space-y-4">
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
                <div className="pt-2">
                  <Button onClick={handleFinalizarOS} disabled={salvando} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm w-full sm:w-auto">
                    <Save size={15} className="mr-2" /> {salvando ? "Finalizando..." : "Finalizar OS"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
