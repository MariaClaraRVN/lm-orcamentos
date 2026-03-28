
-- Add tipo_pessoa and CPF to contratos
ALTER TABLE public.contratos ADD COLUMN tipo_pessoa text NOT NULL DEFAULT 'juridica';
ALTER TABLE public.contratos ADD COLUMN contratante_cpf text NOT NULL DEFAULT '';

-- Create clientes table for auto-fill
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL DEFAULT '',
  cnpj text NOT NULL DEFAULT '',
  cpf text NOT NULL DEFAULT '',
  endereco text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  nome_pessoa text NOT NULL DEFAULT '',
  tipo_pessoa text NOT NULL DEFAULT 'juridica'
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on clientes" ON public.clientes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on clientes" ON public.clientes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on clientes" ON public.clientes FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on clientes" ON public.clientes FOR DELETE TO public USING (true);

-- Create checklists table
CREATE TABLE public.checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  contrato_id uuid REFERENCES public.contratos(id) ON DELETE SET NULL,
  cliente_nome text NOT NULL DEFAULT '',
  data_execucao text NOT NULL DEFAULT '',
  tecnico text NOT NULL DEFAULT '',
  observacoes text NOT NULL DEFAULT '',
  concluido boolean NOT NULL DEFAULT false
);
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on checklists" ON public.checklists FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on checklists" ON public.checklists FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on checklists" ON public.checklists FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on checklists" ON public.checklists FOR DELETE TO public USING (true);

-- Create checklist_itens table
CREATE TABLE public.checklist_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid REFERENCES public.checklists(id) ON DELETE CASCADE NOT NULL,
  descricao text NOT NULL DEFAULT '',
  categoria text NOT NULL DEFAULT '',
  feito boolean NOT NULL DEFAULT false
);
ALTER TABLE public.checklist_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on checklist_itens" ON public.checklist_itens FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on checklist_itens" ON public.checklist_itens FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on checklist_itens" ON public.checklist_itens FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on checklist_itens" ON public.checklist_itens FOR DELETE TO public USING (true);
