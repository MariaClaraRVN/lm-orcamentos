import { supabase } from "@/integrations/supabase/client";

export interface ClienteSalvo {
  id: string;
  created_at: string;
  nome: string;
  cnpj: string;
  cpf: string;
  endereco: string;
  email: string;
  telefone: string;
  nome_pessoa: string;
  tipo_pessoa: string;
}

export async function salvarCliente(dados: Omit<ClienteSalvo, "id" | "created_at">): Promise<ClienteSalvo> {
  // Check if client already exists by CNPJ or CPF
  const identifier = dados.tipo_pessoa === "juridica" ? dados.cnpj : dados.cpf;
  const field = dados.tipo_pessoa === "juridica" ? "cnpj" : "cpf";
  
  if (identifier) {
    const { data: existing } = await supabase
      .from("clientes")
      .select("*")
      .eq(field, identifier)
      .maybeSingle();
    
    if (existing) {
      // Update existing client
      const { data, error } = await supabase
        .from("clientes")
        .update(dados)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as ClienteSalvo;
    }
  }

  const { data, error } = await supabase
    .from("clientes")
    .insert(dados)
    .select()
    .single();
  if (error) throw error;
  return data as ClienteSalvo;
}

export async function listarClientes(): Promise<ClienteSalvo[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true });
  if (error) throw error;
  return (data as ClienteSalvo[]) || [];
}

export async function buscarClientePorDocumento(doc: string): Promise<ClienteSalvo | null> {
  const cleanDoc = doc.replace(/\D/g, "");
  
  const { data: byCnpj } = await supabase
    .from("clientes")
    .select("*")
    .ilike("cnpj", `%${cleanDoc}%`)
    .maybeSingle();
  
  if (byCnpj) return byCnpj as ClienteSalvo;

  const { data: byCpf } = await supabase
    .from("clientes")
    .select("*")
    .ilike("cpf", `%${cleanDoc}%`)
    .maybeSingle();
  
  return byCpf as ClienteSalvo | null;
}
