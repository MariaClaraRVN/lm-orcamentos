import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wrench, User, MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import {
  buscarOrdemServico, buscarDiagnostico, buscarConclusao,
  listarMidias, atualizarStatusOS,
  OrdemServico, Diagnostico, Conclusao, MidiaOS,
  STATUS_LABELS, STATUS_COLORS,
} from "@/hooks/useOrdensServico";

const formatMoeda = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function OrdemServicoView() {
  const { id } = useParams<{ id: string }>();
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [conclusao, setConclusao] = useState<Conclusao | null>(null);
  const [midias, setMidias] = useState<MidiaOS[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoStatus, setNovoStatus] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      buscarOrdemServico(id),
      buscarDiagnostico(id),
      buscarConclusao(id),
      listarMidias(id),
    ]).then(([osData, diagData, concData, midiasData]) => {
      setOs(osData);
      setDiagnostico(diagData);
      setConclusao(concData);
      setMidias(midiasData);
      if (osData) setNovoStatus(osData.status);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    setNovoStatus(status);
    const ok = await atualizarStatusOS(id, status);
    if (ok) {
      setOs((prev) => prev ? { ...prev, status } : prev);
      toast({ title: "Status atualizado", description: `Status alterado para "${STATUS_LABELS[status]}"` });
    } else {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    }
  };

  const getNome = (o: OrdemServico) =>
    (o.tipo_pessoa === "fisica" ? o.cliente_nome_pessoa : o.cliente_nome) || "Cliente";

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground">Carregando...</span></div>;
  if (!os) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground text-lg">OS não encontrada.</p>
      <Link to="/os/historico"><Button variant="outline">Voltar ao Histórico</Button></Link>
    </div>
  );

  const midiasRetirada = midias.filter((m) => m.etapa === "retirada");
  const midiasDiagnostico = midias.filter((m) => m.etapa === "diagnostico");
  const midiasConclusao = midias.filter((m) => m.etapa === "conclusao");

  const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    value ? <div className="flex flex-col sm:flex-row sm:gap-2"><span className="text-xs font-semibold text-muted-foreground uppercase min-w-[140px]">{label}:</span><span className="text-sm text-foreground">{value}</span></div> : null
  );

  const GaleriaMidias = ({ items }: { items: MidiaOS[] }) => items.length === 0 ? null : (
    <div className="flex flex-wrap gap-3 mt-3">
      {items.map((m) => (
        <div key={m.id} className="relative">
          {m.tipo === "foto" ? (
            <img src={m.url} alt={m.descricao || "Mídia"} className="w-24 h-24 object-cover rounded border border-border" />
          ) : (
            <video src={m.url} controls className="w-32 h-24 rounded border border-border" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[hsl(var(--brand-black))] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/"><img style={{ maxWidth: "100px" }} src="/Icon.png" alt="Logo LM" /></Link>
          <span className="text-sm text-gray-400 hidden sm:block">Visualização de OS</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link to="/os/historico" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-1">
              <ArrowLeft size={14} /> Histórico de OS
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {os.numero} <span className="text-primary">— {getNome(os)}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${STATUS_COLORS[os.status] || ""}`}>
              {STATUS_LABELS[os.status] || os.status}
            </span>
            <Select value={novoStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Alterar status" /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alerta de abandono */}
        {os.data_limite_abandono && new Date(os.data_limite_abandono) < new Date() && os.status !== "abandonado" && os.status !== "entregue" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="text-destructive" size={20} />
            <div>
              <p className="text-sm font-semibold text-destructive">Prazo de 90 dias expirado</p>
              <p className="text-xs text-muted-foreground">Data limite: {new Date(os.data_limite_abandono).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        )}

        <Accordion type="multiple" defaultValue={["retirada", "diagnostico", "conclusao"]} className="space-y-3">
          {/* Retirada */}
          <AccordionItem value="retirada" className="bg-card rounded-lg border border-border">
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="font-bold text-primary">📄 Relatório de Retirada</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase mt-2">Dados do Cliente</h4>
              <InfoRow label="Nome" value={getNome(os)} />
              <InfoRow label={os.tipo_pessoa === "juridica" ? "CNPJ" : "CPF"} value={os.tipo_pessoa === "juridica" ? os.cliente_cnpj : os.cliente_cpf} />
              <InfoRow label="Endereço" value={os.cliente_endereco} />
              <InfoRow label="Email" value={os.cliente_email} />
              <InfoRow label="Telefone" value={os.cliente_telefone} />

              <h4 className="text-xs font-bold text-muted-foreground uppercase mt-4">Dados da Máquina</h4>
              <InfoRow label="Tipo" value={os.tipo_maquina === "gerador" ? "Gerador" : "Compressor"} />
              <InfoRow label="Marca" value={os.marca} />
              <InfoRow label="Modelo" value={os.modelo} />
              <InfoRow label="Nº Série" value={os.numero_serie} />
              <InfoRow label="Horímetro" value={os.horimetro} />
              <InfoRow label="Potência" value={os.potencia} />
              <InfoRow label="Tensão" value={os.tensao} />
              <InfoRow label="Estado Geral" value={os.estado_geral} />
              <InfoRow label="Acessórios" value={os.acessorios_entregues} />

              <h4 className="text-xs font-bold text-muted-foreground uppercase mt-4">Dados da Retirada</h4>
              <InfoRow label="Data" value={os.data_retirada} />
              <InfoRow label="Hora" value={os.hora_retirada} />
              <InfoRow label="Local" value={os.local_coleta} />
              <InfoRow label="Responsável" value={os.responsavel_retirada} />
              <InfoRow label="Placa" value={os.placa_veiculo} />
              <InfoRow label="Defeito Relatado" value={os.defeito_relatado} />

              <GaleriaMidias items={midiasRetirada} />

              {os.clausula_permanencia && (
                <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground italic">
                  <strong>Cláusula de Permanência:</strong> {os.clausula_permanencia}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Diagnóstico */}
          <AccordionItem value="diagnostico" className="bg-card rounded-lg border border-border">
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="font-bold text-primary">🔍 Diagnóstico / Teste</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 space-y-3">
              {diagnostico ? (
                <>
                  <InfoRow label="Técnico" value={diagnostico.tecnico_responsavel} />
                  <InfoRow label="Data do Teste" value={diagnostico.data_teste} />
                  <InfoRow label="Problema" value={diagnostico.problema_identificado} />
                  <InfoRow label="Peças Danificadas" value={diagnostico.pecas_danificadas} />
                  <InfoRow label="Causa Provável" value={diagnostico.causa_provavel} />
                  <InfoRow label="Testes" value={diagnostico.testes_realizados} />
                  <InfoRow label="Resultado" value={diagnostico.resultado_final} />
                  <InfoRow label="Observações" value={diagnostico.observacoes} />
                  <GaleriaMidias items={midiasDiagnostico} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Diagnóstico ainda não registrado.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Conclusão */}
          <AccordionItem value="conclusao" className="bg-card rounded-lg border border-border">
            <AccordionTrigger className="px-6 py-3 hover:no-underline">
              <span className="font-bold text-primary">✅ Conclusão / Entrega</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 space-y-3">
              {conclusao ? (
                <>
                  <InfoRow label="Serviços" value={conclusao.servicos_executados} />
                  <InfoRow label="Peças Substituídas" value={conclusao.pecas_substituidas} />
                  <InfoRow label="Valor Final" value={formatMoeda(conclusao.valor_final)} />
                  <InfoRow label="Data Conclusão" value={conclusao.data_conclusao} />
                  <InfoRow label="Data Entrega" value={conclusao.data_entrega} />
                  <InfoRow label="Garantia" value={`${conclusao.garantia_meses} meses`} />
                  <InfoRow label="Observações" value={conclusao.observacoes_finais} />
                  <GaleriaMidias items={midiasConclusao} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Conclusão ainda não registrada.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <footer className="mt-12 bg-[hsl(var(--brand-black))] text-gray-400 text-xs text-center py-4">
        LM Manutenções © {new Date().getFullYear()} — Sistema de Gestão
      </footer>
    </div>
  );
}
