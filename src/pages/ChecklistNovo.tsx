import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { criarChecklist } from "@/hooks/useChecklists";
import { listarContratos, ContratoSalvo } from "@/hooks/useContratos";
import { supabase } from "@/integrations/supabase/client";

const TECNICO_FIXO = "Lincoln Carlos Vianna";

export default function ChecklistNovo() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<ContratoSalvo[]>([]);
  const [contratoId, setContratoId] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteCnpj, setClienteCnpj] = useState("");
  const [clienteCpf, setClienteCpf] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("juridica");
  const [marcaMaquina, setMarcaMaquina] = useState("");
  const [modeloMaquina, setModeloMaquina] = useState("");
  const [dataExecucao, setDataExecucao] = useState(new Date().toLocaleDateString("pt-BR"));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarContratos().then(setContratos).catch(() => {});
  }, []);

  const handleContratoChange = async (id: string) => {
    setContratoId(id);
    const c = contratos.find(ct => ct.id === id);
    if (c) {
      setClienteNome(c.contratante_razao_social);
      setClienteEndereco(c.contratante_endereco || "");
      setClienteCnpj(c.contratante_cnpj || "");
      setClienteCpf(c.contratante_cpf || "");
      setTipoPessoa(c.tipo_pessoa || "juridica");
      if (c.equipamento_descricao) {
        setMarcaMaquina("");
        setModeloMaquina(c.equipamento_descricao);
      }

      // Buscar dados completos do cliente na tabela clientes
      const doc = c.tipo_pessoa === "fisica" ? c.contratante_cpf : c.contratante_cnpj;
      if (doc) {
        const col = c.tipo_pessoa === "fisica" ? "cpf" : "cnpj";
        const { data: cliente } = await supabase
          .from("clientes")
          .select("*")
          .eq(col, doc)
          .maybeSingle();
        if (cliente) {
          setClienteEmail(cliente.email || "");
          setClienteTelefone(cliente.telefone || "");
          if (cliente.endereco) setClienteEndereco(cliente.endereco);
        }
      }
    }
  };

  const salvar = async () => {
    if (!clienteNome.trim()) return toast({ title: "Informe o nome do cliente", variant: "destructive" });
    setSalvando(true);
    try {
      const id = await criarChecklist({
        contrato_id: contratoId || undefined,
        cliente_nome: clienteNome,
        data_execucao: dataExecucao,
        tecnico: TECNICO_FIXO,
        marca_maquina: marcaMaquina,
        modelo_maquina: modeloMaquina,
        cliente_endereco: clienteEndereco,
        cliente_telefone: clienteTelefone,
        cliente_cnpj: clienteCnpj,
        cliente_cpf: clienteCpf,
        cliente_email: clienteEmail,
        tipo_pessoa: tipoPessoa,
      });
      if (id) {
        toast({ title: "Checklist criado!" });
        navigate(`/checklist/${id}`);
      } else {
        toast({ title: "Erro ao criar checklist", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao criar checklist", variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titulo="Novo Checklist de Manutenção" />
      <main className="max-w-3xl mx-auto px-3 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-2">
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vincular a um Contrato (opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={contratoId} onValueChange={handleContratoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar contrato..." />
              </SelectTrigger>
              <SelectContent>
                {contratos.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.contratante_razao_social} — {c.equipamento_descricao || "Sem equipamento"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nome / Razão Social</Label>
              <Input value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CNPJ</Label>
                <Input value={clienteCnpj} onChange={e => setClienteCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <Label>CPF</Label>
                <Input value={clienteCpf} onChange={e => setClienteCpf(e.target.value)} placeholder="000.000.000-00" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={clienteTelefone} onChange={e => setClienteTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={clienteEndereco} onChange={e => setClienteEndereco(e.target.value)} placeholder="Endereço do cliente" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados da Máquina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Marca</Label>
              <Input value={marcaMaquina} onChange={e => setMarcaMaquina(e.target.value)} placeholder="Marca da máquina" />
            </div>
            <div>
              <Label>Modelo</Label>
              <Input value={modeloMaquina} onChange={e => setModeloMaquina(e.target.value)} placeholder="Modelo da máquina" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados do Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Técnico Responsável</Label>
              <Input value={TECNICO_FIXO} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Data de Execução</Label>
              <Input value={dataExecucao} onChange={e => setDataExecucao(e.target.value)} placeholder="DD/MM/AAAA" />
            </div>
          </CardContent>
        </Card>

        <Button onClick={salvar} disabled={salvando} className="w-full py-6 text-base font-bold">
          <ClipboardCheck size={20} className="mr-2" />
          {salvando ? "Criando..." : "Criar Checklist"}
        </Button>
      </main>
    </div>
  );
}
