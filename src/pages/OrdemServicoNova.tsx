import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Save, Camera, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { criarOrdemServico, uploadMidia, MidiaOS } from "@/hooks/useOrdensServico";
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

  const [midiasRetirada, setMidiasRetirada] = useState<MidiaOS[]>([]);
  const [uploading, setUploading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSalvarOS = async () => {
    const nome = tipoPessoa === "juridica" ? clienteNome.trim() : clienteNomePessoa.trim();
    if (!nome) {
      toast({ title: "Campo obrigatório", description: tipoPessoa === "juridica" ? "Preencha o nome da empresa." : "Preencha o nome do cliente.", variant: "destructive" });
      return;
    }
    if (!marca.trim() || !modelo.trim()) {
      toast({ title: "Campo obrigatório", description: "Preencha a marca e o modelo da máquina.", variant: "destructive" });
      return;
    }
    if (!defeitoRelatado.trim()) {
      toast({ title: "Campo obrigatório", description: "Descreva o defeito relatado.", variant: "destructive" });
      return;
    }
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
        clausula_permanencia: CLAUSULA_PADRAO,
      });
      if (id) {
        setOsId(id);
        toast({ title: "OS criada com sucesso!", description: "Você pode adicionar fotos e depois visualizar a OS." });
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
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Nova Ordem de Serviço — Relatório de Retirada</h1>
          {osId && <p className="text-xs text-muted-foreground mt-1">OS criada — ID salvo</p>}
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="bg-primary px-4 py-2.5">
            <h2 className="text-primary-foreground font-bold text-sm">📄 Relatório de Retirada de Máquina</h2>
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

            {/* Cláusula - READ ONLY */}
            <div>
              <SectionTitle>Cláusula de Permanência</SectionTitle>
              <div className="p-3 bg-muted rounded text-xs sm:text-sm text-muted-foreground italic border border-border">
                {CLAUSULA_PADRAO}
              </div>
            </div>

            {/* Ações */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Button onClick={handleSalvarOS} disabled={salvando || !!osId} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm w-full sm:w-auto">
                <Save size={15} className="mr-2" />
                {salvando ? "Salvando..." : osId ? "OS Salva ✓" : "Salvar OS"}
              </Button>
              {osId && (
                <Link to={`/os/${osId}`}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm">
                    Abrir OS →
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[hsl(var(--brand-black))] text-gray-400 text-[10px] sm:text-xs text-center py-3">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
