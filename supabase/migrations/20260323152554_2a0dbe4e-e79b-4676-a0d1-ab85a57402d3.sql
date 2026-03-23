
CREATE TABLE public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contratada_razao_social TEXT NOT NULL DEFAULT '',
  contratada_cnpj TEXT NOT NULL DEFAULT '',
  contratada_endereco TEXT NOT NULL DEFAULT '',
  contratante_razao_social TEXT NOT NULL DEFAULT '',
  contratante_cnpj TEXT NOT NULL DEFAULT '',
  contratante_endereco TEXT NOT NULL DEFAULT '',
  equipamento_descricao TEXT NOT NULL DEFAULT '',
  valor_visita_emergencia TEXT NOT NULL DEFAULT '',
  valor_mensal TEXT NOT NULL DEFAULT '',
  cidade TEXT NOT NULL DEFAULT '',
  data_contrato TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on contratos" ON public.contratos FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on contratos" ON public.contratos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on contratos" ON public.contratos FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on contratos" ON public.contratos FOR DELETE TO public USING (true);
