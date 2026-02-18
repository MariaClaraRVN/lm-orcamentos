
-- Create orcamentos table
CREATE TABLE public.orcamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL,
  data TEXT NOT NULL,
  cliente_nome TEXT NOT NULL DEFAULT '',
  cliente_cnpj TEXT NOT NULL DEFAULT '',
  cliente_endereco TEXT NOT NULL DEFAULT '',
  observacoes TEXT NOT NULL DEFAULT '',
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create itens_orcamento table
CREATE TABLE public.itens_orcamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  descricao TEXT NOT NULL DEFAULT '',
  valor_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_orcamento ENABLE ROW LEVEL SECURITY;

-- Public access policies for orcamentos
CREATE POLICY "Allow public select on orcamentos"
  ON public.orcamentos FOR SELECT USING (true);

CREATE POLICY "Allow public insert on orcamentos"
  ON public.orcamentos FOR INSERT WITH CHECK (true);

-- Public access policies for itens_orcamento
CREATE POLICY "Allow public select on itens_orcamento"
  ON public.itens_orcamento FOR SELECT USING (true);

CREATE POLICY "Allow public insert on itens_orcamento"
  ON public.itens_orcamento FOR INSERT WITH CHECK (true);
