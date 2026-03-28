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

export default function ChecklistNovo() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<ContratoSalvo[]>([]);
  const [contratoId, setContratoId] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [dataExecucao, setDataExecucao] = useState(new Date().toLocaleDateString("pt-BR"));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarContratos().then(setContratos).catch(() => {});
  }, []);

  const handleContratoChange = (id: string) => {
    setContratoId(id);
    const c = contratos.find(ct => ct.id === id);
    if (c) setClienteNome(c.contratante_razao_social);
  };

  const salvar = async () => {
    if (!clienteNome.trim()) return toast({ title: "Informe o nome do cliente", variant: "destructive" });
    if (!tecnico.trim()) return toast({ title: "Informe o técnico responsável", variant: "destructive" });
    setSalvando(true);
    try {
      const id = await criarChecklist({
        contrato_id: contratoId || undefined,
        cliente_nome: clienteNome,
        data_execucao: dataExecucao,
        tecnico,
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
            <CardTitle className="text-base">Dados do Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nome do Cliente</Label>
              <Input value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div>
              <Label>Técnico Responsável</Label>
              <Input value={tecnico} onChange={e => setTecnico(e.target.value)} placeholder="Nome do técnico" />
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
