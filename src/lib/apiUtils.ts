// ViaCEP - busca endereço por CEP
export interface ViaCEPResult {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function buscarCEP(cep: string): Promise<ViaCEPResult | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return data as ViaCEPResult;
  } catch {
    return null;
  }
}

// ReceitaWS - busca dados por CNPJ (free tier)
export interface CNPJResult {
  nome: string;
  fantasia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
}

export async function buscarCNPJ(cnpj: string): Promise<CNPJResult | null> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return null;
  try {
    const res = await fetch(`https://receitaws.com.br/v1/cnpj/${digits}`);
    const data = await res.json();
    if (data.status === "ERROR") return null;
    return data as CNPJResult;
  } catch {
    return null;
  }
}

export function formatarEnderecoCEP(cep: ViaCEPResult): string {
  return [cep.logradouro, cep.bairro, `${cep.localidade} - ${cep.uf}`].filter(Boolean).join(", ");
}
