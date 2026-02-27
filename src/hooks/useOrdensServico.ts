import { supabase } from "@/integrations/supabase/client";

export interface OrdemServico {
  id: string;
  numero: string;
  status: string;
  cliente_nome: string;
  cliente_cnpj: string;
  cliente_cpf: string;
  cliente_nome_pessoa: string;
  cliente_email: string;
  cliente_telefone: string;
  cliente_endereco: string;
  tipo_pessoa: string;
  tipo_maquina: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  horimetro: string;
  potencia: string;
  tensao: string;
  estado_geral: string;
  acessorios_entregues: string;
  data_retirada: string;
  hora_retirada: string;
  local_coleta: string;
  responsavel_retirada: string;
  placa_veiculo: string;
  defeito_relatado: string;
  clausula_permanencia: string;
  data_limite_abandono: string | null;
  orcamento_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Diagnostico {
  id: string;
  os_id: string;
  tecnico_responsavel: string;
  data_teste: string;
  problema_identificado: string;
  pecas_danificadas: string;
  causa_provavel: string;
  testes_realizados: string;
  resultado_final: string;
  observacoes: string;
  created_at: string;
}

export interface Conclusao {
  id: string;
  os_id: string;
  servicos_executados: string;
  pecas_substituidas: string;
  valor_final: number;
  data_conclusao: string;
  data_entrega: string;
  garantia_meses: number;
  observacoes_finais: string;
  created_at: string;
}

export interface MidiaOS {
  id: string;
  os_id: string;
  etapa: string;
  tipo: string;
  url: string;
  descricao: string;
  created_at: string;
}

const CLAUSULA_PADRAO = "Após 90 dias sem aprovação de orçamento ou manifestação formal do cliente, e mediante notificação registrada, o equipamento poderá ser considerado abandonado, podendo ser aplicadas as disposições legais vigentes.";

export const STATUS_LABELS: Record<string, string> = {
  aguardando_diagnostico: "Aguardando Diagnóstico",
  aguardando_orcamento: "Aguardando Orçamento",
  aguardando_aprovacao: "Aguardando Aprovação",
  aprovado: "Aprovado",
  em_execucao: "Em Execução",
  finalizado: "Finalizado",
  entregue: "Entregue",
  abandonado: "Abandonado",
};

export const STATUS_COLORS: Record<string, string> = {
  aguardando_diagnostico: "bg-yellow-100 text-yellow-800 border-yellow-300",
  aguardando_orcamento: "bg-orange-100 text-orange-800 border-orange-300",
  aguardando_aprovacao: "bg-blue-100 text-blue-800 border-blue-300",
  aprovado: "bg-green-100 text-green-800 border-green-300",
  em_execucao: "bg-purple-100 text-purple-800 border-purple-300",
  finalizado: "bg-teal-100 text-teal-800 border-teal-300",
  entregue: "bg-emerald-100 text-emerald-800 border-emerald-300",
  abandonado: "bg-red-100 text-red-800 border-red-300",
};

// ---- CRUD Ordem de Serviço ----

export async function criarOrdemServico(dados: Partial<OrdemServico>): Promise<string | null> {
  const { data, error } = await supabase
    .from("ordens_servico")
    .insert({
      numero: "auto",
      status: "aguardando_diagnostico",
      cliente_nome: dados.cliente_nome || "",
      cliente_cnpj: dados.cliente_cnpj || "",
      cliente_cpf: dados.cliente_cpf || "",
      cliente_nome_pessoa: dados.cliente_nome_pessoa || "",
      cliente_email: dados.cliente_email || "",
      cliente_telefone: dados.cliente_telefone || "",
      cliente_endereco: dados.cliente_endereco || "",
      tipo_pessoa: dados.tipo_pessoa || "juridica",
      tipo_maquina: dados.tipo_maquina || "gerador",
      marca: dados.marca || "",
      modelo: dados.modelo || "",
      numero_serie: dados.numero_serie || "",
      horimetro: dados.horimetro || "",
      potencia: dados.potencia || "",
      tensao: dados.tensao || "",
      estado_geral: dados.estado_geral || "",
      acessorios_entregues: dados.acessorios_entregues || "",
      data_retirada: dados.data_retirada || "",
      hora_retirada: dados.hora_retirada || "",
      local_coleta: dados.local_coleta || "",
      responsavel_retirada: dados.responsavel_retirada || "",
      placa_veiculo: dados.placa_veiculo || "",
      defeito_relatado: dados.defeito_relatado || "",
      clausula_permanencia: dados.clausula_permanencia || CLAUSULA_PADRAO,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar OS:", error);
    return null;
  }
  return data?.id ?? null;
}

export async function listarOrdensServico(): Promise<OrdemServico[]> {
  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao listar OS:", error);
    return [];
  }
  return (data ?? []) as OrdemServico[];
}

export async function buscarOrdemServico(id: string): Promise<OrdemServico | null> {
  const { data, error } = await supabase
    .from("ordens_servico")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as OrdemServico;
}

export async function atualizarStatusOS(id: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from("ordens_servico")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar status:", error);
    return false;
  }
  return true;
}

export async function excluirOrdemServico(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("ordens_servico")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir OS:", error);
    return false;
  }
  return true;
}

// ---- Diagnóstico ----

export async function salvarDiagnostico(dados: Partial<Diagnostico>): Promise<string | null> {
  const { data, error } = await supabase
    .from("diagnosticos")
    .insert({
      os_id: dados.os_id!,
      tecnico_responsavel: dados.tecnico_responsavel || "",
      data_teste: dados.data_teste || "",
      problema_identificado: dados.problema_identificado || "",
      pecas_danificadas: dados.pecas_danificadas || "",
      causa_provavel: dados.causa_provavel || "",
      testes_realizados: dados.testes_realizados || "",
      resultado_final: dados.resultado_final || "",
      observacoes: dados.observacoes || "",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao salvar diagnóstico:", error);
    return null;
  }
  return data?.id ?? null;
}

export async function buscarDiagnostico(osId: string): Promise<Diagnostico | null> {
  const { data, error } = await supabase
    .from("diagnosticos")
    .select("*")
    .eq("os_id", osId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as Diagnostico | null;
}

// ---- Conclusão ----

export async function salvarConclusao(dados: Partial<Conclusao>): Promise<string | null> {
  const { data, error } = await supabase
    .from("conclusoes")
    .insert({
      os_id: dados.os_id!,
      servicos_executados: dados.servicos_executados || "",
      pecas_substituidas: dados.pecas_substituidas || "",
      valor_final: dados.valor_final || 0,
      data_conclusao: dados.data_conclusao || "",
      data_entrega: dados.data_entrega || "",
      garantia_meses: dados.garantia_meses || 0,
      observacoes_finais: dados.observacoes_finais || "",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao salvar conclusão:", error);
    return null;
  }
  return data?.id ?? null;
}

export async function buscarConclusao(osId: string): Promise<Conclusao | null> {
  const { data, error } = await supabase
    .from("conclusoes")
    .select("*")
    .eq("os_id", osId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data as Conclusao | null;
}

// ---- Mídias ----

export async function uploadMidia(
  osId: string,
  etapa: string,
  file: File,
  descricao: string = ""
): Promise<MidiaOS | null> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${osId}/${etapa}/${Date.now()}.${ext}`;
  const tipo = file.type.startsWith("video/") ? "video" : "foto";

  const { error: uploadErr } = await supabase.storage
    .from("os-midias")
    .upload(path, file);

  if (uploadErr) {
    console.error("Erro no upload:", uploadErr);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("os-midias")
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from("midias_os")
    .insert({
      os_id: osId,
      etapa,
      tipo,
      url: urlData.publicUrl,
      descricao,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao salvar mídia:", error);
    return null;
  }
  return data as MidiaOS;
}

export async function listarMidias(osId: string, etapa?: string): Promise<MidiaOS[]> {
  let query = supabase
    .from("midias_os")
    .select("*")
    .eq("os_id", osId)
    .order("created_at", { ascending: true });

  if (etapa) {
    query = query.eq("etapa", etapa);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as MidiaOS[];
}

export async function excluirMidia(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("midias_os")
    .delete()
    .eq("id", id);

  return !error;
}
