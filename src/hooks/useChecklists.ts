import { supabase } from "@/integrations/supabase/client";

export type ChecklistItemStatus = "sim" | "nao" | "nao_contem" | "pendente";

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  descricao: string;
  categoria: string;
  status: ChecklistItemStatus;
}

export interface ChecklistSalvo {
  id: string;
  created_at: string;
  contrato_id: string | null;
  cliente_nome: string;
  data_execucao: string;
  tecnico: string;
  observacoes: string;
  concluido: boolean;
  itens?: ChecklistItem[];
}

export const CHECKLIST_ITENS_PADRAO: { categoria: string; descricao: string }[] = [
  { categoria: "I. Alimentação de Combustível", descricao: "Avaliação dos tanques e nível de combustível" },
  { categoria: "I. Alimentação de Combustível", descricao: "Verificação de vazamentos e obstruções" },
  { categoria: "I. Alimentação de Combustível", descricao: "Drenagem de água e impurezas" },
  { categoria: "I. Alimentação de Combustível", descricao: "Controle da quantidade e condições dos filtros" },
  { categoria: "II. Bomba Injetora e Bicos", descricao: "Verificações de fixações, vazamentos e reapertos" },
  { categoria: "II. Bomba Injetora e Bicos", descricao: "Avaliação da necessidade de calibração" },
  { categoria: "II. Bomba Injetora e Bicos", descricao: "Limpeza de pré-filtro da bomba alimentadora" },
  { categoria: "III. Motores e Óleo Lubrificante", descricao: "Verificação e controle de nível, viscosidade e temperatura do óleo" },
  { categoria: "III. Motores e Óleo Lubrificante", descricao: "Identificação da necessidade de substituição do óleo e filtros" },
  { categoria: "IV. Sistema de Refrigeração", descricao: "Avaliação do nível de água, mangueiras, colmeias e vazamentos" },
  { categoria: "IV. Sistema de Refrigeração", descricao: "Verificação de aditivo e bomba d'água" },
  { categoria: "IV. Sistema de Refrigeração", descricao: "Verificação de correias, grades de proteção e ventiladores" },
  { categoria: "V. Filtro de Ar e Turbinas", descricao: "Verificação de conservação e restrição dos filtros" },
  { categoria: "V. Filtro de Ar e Turbinas", descricao: "Avaliação do turbo compressor, folgas e vazamentos" },
  { categoria: "VI. Pré-aquecimento e Baterias", descricao: "Inspeção elétrica, resistência, conexões, tensão e corrente" },
  { categoria: "VII. Reguladores e Sensores", descricao: "Ajustes e testes de sensores magnéticos e reguladores de velocidade" },
  { categoria: "VIII. Alternador e Regulador", descricao: "Limpeza, aperto de terminais, lubrificação e medições" },
  { categoria: "IX. Controle, Alarmes e Proteções", descricao: "Simulações elétricas, verificações de sensores e lógicas de controle" },
  { categoria: "IX. Controle, Alarmes e Proteções", descricao: "Verificação da integridade dos cabos" },
  { categoria: "X. Partida e Verificações Gerais", descricao: "Avaliação do motor de partida e bateria" },
  { categoria: "X. Partida e Verificações Gerais", descricao: "Verificação de vibrações, ruídos, instrumentos, correias e polias" },
];

export async function criarChecklist(dados: {
  contrato_id?: string;
  cliente_nome: string;
  data_execucao: string;
  tecnico: string;
}): Promise<string | null> {
  const { data: checklist, error } = await supabase
    .from("checklists")
    .insert({
      contrato_id: dados.contrato_id || null,
      cliente_nome: dados.cliente_nome,
      data_execucao: dados.data_execucao,
      tecnico: dados.tecnico,
    })
    .select("id")
    .single();

  if (error || !checklist) {
    console.error("Erro ao criar checklist:", error);
    return null;
  }

  const itensPayload = CHECKLIST_ITENS_PADRAO.map((item) => ({
    checklist_id: checklist.id,
    descricao: item.descricao,
    categoria: item.categoria,
    status: "pendente",
  }));

  const { error: itensErr } = await supabase.from("checklist_itens").insert(itensPayload);
  if (itensErr) console.error("Erro ao inserir itens:", itensErr);

  return checklist.id;
}

export async function listarChecklists(): Promise<ChecklistSalvo[]> {
  const { data, error } = await supabase
    .from("checklists")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []) as ChecklistSalvo[];
}

export async function buscarChecklist(id: string): Promise<ChecklistSalvo | null> {
  const { data, error } = await supabase
    .from("checklists")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;

  const { data: itens } = await supabase
    .from("checklist_itens")
    .select("*")
    .eq("checklist_id", id)
    .order("categoria", { ascending: true });

  return { ...(data as ChecklistSalvo), itens: (itens ?? []) as ChecklistItem[] };
}

export async function atualizarItemChecklist(itemId: string, status: ChecklistItemStatus) {
  const { error } = await supabase
    .from("checklist_itens")
    .update({ status })
    .eq("id", itemId);
  if (error) throw error;
}

export async function atualizarChecklist(id: string, dados: { observacoes?: string; concluido?: boolean; tecnico?: string }) {
  const { error } = await supabase
    .from("checklists")
    .update(dados)
    .eq("id", id);
  if (error) throw error;
}

export async function excluirChecklist(id: string) {
  await supabase.from("checklist_itens").delete().eq("checklist_id", id);
  const { error } = await supabase.from("checklists").delete().eq("id", id);
  if (error) throw error;
}
