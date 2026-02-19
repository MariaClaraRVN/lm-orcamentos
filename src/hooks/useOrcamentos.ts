import { supabase } from "@/integrations/supabase/client";
import { ItemOrcamento, DadosOrcamento } from "@/components/OrcamentoPDF";

export interface OrcamentoSalvo {
  id: string;
  numero: string;
  data: string;
  cliente_nome: string;
  cliente_cnpj: string;
  cliente_endereco: string;
  observacoes: string;
  total: number;
  created_at: string;
  itens?: ItemOrcamento[];
}

export async function salvarOrcamento(dados: DadosOrcamento, total: number): Promise<string | null> {
  // Insert orcamento
  const { data: orcamento, error: orcErr } = await supabase
    .from("orcamentos")
    .insert({
      numero: dados.numero,
      data: dados.data,
      cliente_nome: dados.clienteNome,
      cliente_cnpj: dados.clienteCnpj,
      cliente_endereco: dados.clienteEndereco ?? "",
      observacoes: dados.observacoes ?? "",
      total,
    })
    .select("id")
    .single();

  if (orcErr || !orcamento) {
    console.error("Erro ao salvar orçamento:", orcErr);
    return null;
  }

  // Insert itens
  const itensPayload = dados.itens.map((item) => ({
    orcamento_id: orcamento.id,
    quantidade: item.quantidade,
    descricao: item.descricao,
    valor_unitario: item.valorUnitario,
  }));

  const { error: itensErr } = await supabase
    .from("itens_orcamento")
    .insert(itensPayload);

  if (itensErr) {
    console.error("Erro ao salvar itens:", itensErr);
  }

  return orcamento.id;
}

export async function listarOrcamentos(): Promise<OrcamentoSalvo[]> {
  const { data, error } = await supabase
    .from("orcamentos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar orçamentos:", error);
    return [];
  }

  return (data ?? []) as OrcamentoSalvo[];
}

export async function buscarOrcamento(id: string): Promise<OrcamentoSalvo | null> {
  const { data: orcamento, error } = await supabase
    .from("orcamentos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !orcamento) return null;

  const { data: itens } = await supabase
    .from("itens_orcamento")
    .select("*")
    .eq("orcamento_id", id);

  const itensFormatados: ItemOrcamento[] = (itens ?? []).map((i: any) => ({
    id: i.id,
    quantidade: i.quantidade,
    descricao: i.descricao,
    valorUnitario: Number(i.valor_unitario),
  }));

  return { ...(orcamento as OrcamentoSalvo), itens: itensFormatados };
}

export async function excluirOrcamento(id: string): Promise<boolean> {
  // Delete itens first (FK constraint)
  const { error: itensErr } = await supabase
    .from("itens_orcamento")
    .delete()
    .eq("orcamento_id", id);

  if (itensErr) {
    console.error("Erro ao excluir itens:", itensErr);
    return false;
  }

  const { error } = await supabase
    .from("orcamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir orçamento:", error);
    return false;
  }

  return true;
}
