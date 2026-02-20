
-- Function to generate sequential number ORC-YYYY-NNN
CREATE OR REPLACE FUNCTION public.gerar_numero_orcamento()
RETURNS TRIGGER AS $$
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
  FROM public.orcamentos
  WHERE numero LIKE 'ORC-' || ano || '-%';
  
  novo_numero := 'ORC-' || ano || '-' || LPAD(seq::TEXT, 3, '0');
  NEW.numero := novo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-set numero on insert
CREATE TRIGGER set_numero_orcamento
BEFORE INSERT ON public.orcamentos
FOR EACH ROW
EXECUTE FUNCTION public.gerar_numero_orcamento();

-- Add CPF and nome_pessoa fields
ALTER TABLE public.orcamentos ADD COLUMN cliente_cpf TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orcamentos ADD COLUMN cliente_nome_pessoa TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orcamentos ADD COLUMN tipo_pessoa TEXT NOT NULL DEFAULT 'juridica';
