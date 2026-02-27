
-- Tabela ordens_servico
CREATE TABLE public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'aguardando_diagnostico',
  -- Cliente
  cliente_nome TEXT NOT NULL DEFAULT '',
  cliente_cnpj TEXT NOT NULL DEFAULT '',
  cliente_cpf TEXT NOT NULL DEFAULT '',
  cliente_nome_pessoa TEXT NOT NULL DEFAULT '',
  cliente_email TEXT NOT NULL DEFAULT '',
  cliente_telefone TEXT NOT NULL DEFAULT '',
  cliente_endereco TEXT NOT NULL DEFAULT '',
  tipo_pessoa TEXT NOT NULL DEFAULT 'juridica',
  -- Máquina
  tipo_maquina TEXT NOT NULL DEFAULT 'gerador',
  marca TEXT NOT NULL DEFAULT '',
  modelo TEXT NOT NULL DEFAULT '',
  numero_serie TEXT NOT NULL DEFAULT '',
  horimetro TEXT NOT NULL DEFAULT '',
  potencia TEXT NOT NULL DEFAULT '',
  tensao TEXT NOT NULL DEFAULT '',
  estado_geral TEXT NOT NULL DEFAULT '',
  acessorios_entregues TEXT NOT NULL DEFAULT '',
  -- Retirada
  data_retirada TEXT NOT NULL DEFAULT '',
  hora_retirada TEXT NOT NULL DEFAULT '',
  local_coleta TEXT NOT NULL DEFAULT '',
  responsavel_retirada TEXT NOT NULL DEFAULT '',
  placa_veiculo TEXT NOT NULL DEFAULT '',
  defeito_relatado TEXT NOT NULL DEFAULT '',
  -- Cláusula e abandono
  clausula_permanencia TEXT NOT NULL DEFAULT 'Após 90 dias sem aprovação de orçamento ou manifestação formal do cliente, e mediante notificação registrada, o equipamento poderá ser considerado abandonado, podendo ser aplicadas as disposições legais vigentes.',
  data_limite_abandono TIMESTAMPTZ,
  -- Vínculo com orçamento
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on ordens_servico" ON public.ordens_servico FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ordens_servico" ON public.ordens_servico FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ordens_servico" ON public.ordens_servico FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ordens_servico" ON public.ordens_servico FOR DELETE USING (true);

-- Tabela diagnosticos
CREATE TABLE public.diagnosticos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tecnico_responsavel TEXT NOT NULL DEFAULT '',
  data_teste TEXT NOT NULL DEFAULT '',
  problema_identificado TEXT NOT NULL DEFAULT '',
  pecas_danificadas TEXT NOT NULL DEFAULT '',
  causa_provavel TEXT NOT NULL DEFAULT '',
  testes_realizados TEXT NOT NULL DEFAULT '',
  resultado_final TEXT NOT NULL DEFAULT '',
  observacoes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on diagnosticos" ON public.diagnosticos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on diagnosticos" ON public.diagnosticos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on diagnosticos" ON public.diagnosticos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on diagnosticos" ON public.diagnosticos FOR DELETE USING (true);

-- Tabela conclusoes
CREATE TABLE public.conclusoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  servicos_executados TEXT NOT NULL DEFAULT '',
  pecas_substituidas TEXT NOT NULL DEFAULT '',
  valor_final NUMERIC NOT NULL DEFAULT 0,
  data_conclusao TEXT NOT NULL DEFAULT '',
  data_entrega TEXT NOT NULL DEFAULT '',
  garantia_meses INTEGER NOT NULL DEFAULT 0,
  observacoes_finais TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.conclusoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on conclusoes" ON public.conclusoes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on conclusoes" ON public.conclusoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on conclusoes" ON public.conclusoes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on conclusoes" ON public.conclusoes FOR DELETE USING (true);

-- Tabela midias_os
CREATE TABLE public.midias_os (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL DEFAULT 'retirada',
  tipo TEXT NOT NULL DEFAULT 'foto',
  url TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.midias_os ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on midias_os" ON public.midias_os FOR SELECT USING (true);
CREATE POLICY "Allow public insert on midias_os" ON public.midias_os FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on midias_os" ON public.midias_os FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on midias_os" ON public.midias_os FOR DELETE USING (true);

-- Bucket para mídias
INSERT INTO storage.buckets (id, name, public) VALUES ('os-midias', 'os-midias', true);

CREATE POLICY "Allow public select on os-midias" ON storage.objects FOR SELECT USING (bucket_id = 'os-midias');
CREATE POLICY "Allow public insert on os-midias" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'os-midias');
CREATE POLICY "Allow public update on os-midias" ON storage.objects FOR UPDATE USING (bucket_id = 'os-midias');
CREATE POLICY "Allow public delete on os-midias" ON storage.objects FOR DELETE USING (bucket_id = 'os-midias');

-- Trigger para gerar número automático da OS
CREATE OR REPLACE FUNCTION public.gerar_numero_os()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  ano TEXT;
  seq INT;
  novo_numero TEXT;
BEGIN
  ano := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(numero FROM '[0-9]+$') AS INT)
  ), 0) + 1
  INTO seq
  FROM public.ordens_servico
  WHERE numero LIKE 'OS-' || ano || '-%';
  
  novo_numero := 'OS-' || ano || '-' || LPAD(seq::TEXT, 3, '0');
  NEW.numero := novo_numero;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_gerar_numero_os
BEFORE INSERT ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.gerar_numero_os();

-- Trigger para calcular data_limite_abandono (data_retirada + 90 dias)
CREATE OR REPLACE FUNCTION public.calcular_data_limite_abandono()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.data_retirada IS NOT NULL AND NEW.data_retirada != '' THEN
    BEGIN
      NEW.data_limite_abandono := (to_date(NEW.data_retirada, 'DD/MM/YYYY') + INTERVAL '90 days')::timestamptz;
    EXCEPTION WHEN OTHERS THEN
      NEW.data_limite_abandono := (now() + INTERVAL '90 days');
    END;
  ELSE
    NEW.data_limite_abandono := (now() + INTERVAL '90 days');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calcular_data_limite_abandono
BEFORE INSERT OR UPDATE ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.calcular_data_limite_abandono();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_ordens_servico_updated_at
BEFORE UPDATE ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
