import { supabase } from "@/integrations/supabase/client";

export interface ContratoSalvo {
  id: string;
  created_at: string;
  contratada_razao_social: string;
  contratada_cnpj: string;
  contratada_endereco: string;
  contratante_razao_social: string;
  contratante_cnpj: string;
  contratante_cpf: string;
  contratante_endereco: string;
  equipamento_descricao: string;
  valor_visita_emergencia: string;
  valor_mensal: string;
  cidade: string;
  data_contrato: string;
  tipo_pessoa: string;
}

export async function salvarContrato(dados: Omit<ContratoSalvo, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("contratos")
    .insert(dados)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listarContratos(): Promise<ContratoSalvo[]> {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ContratoSalvo[]) || [];
}

export async function buscarContrato(id: string): Promise<ContratoSalvo | null> {
  const { data, error } = await supabase
    .from("contratos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ContratoSalvo;
}

export async function excluirContrato(id: string) {
  const { error } = await supabase.from("contratos").delete().eq("id", id);
  if (error) throw error;
}
