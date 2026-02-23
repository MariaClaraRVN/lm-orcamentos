
-- Drop existing RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Allow public delete on itens_orcamento" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Allow public insert on itens_orcamento" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Allow public select on itens_orcamento" ON public.itens_orcamento;

DROP POLICY IF EXISTS "Allow public delete on orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Allow public insert on orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Allow public select on orcamentos" ON public.orcamentos;

-- Recreate as PERMISSIVE
CREATE POLICY "Allow public select on orcamentos" ON public.orcamentos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on orcamentos" ON public.orcamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on orcamentos" ON public.orcamentos FOR DELETE USING (true);
CREATE POLICY "Allow public update on orcamentos" ON public.orcamentos FOR UPDATE USING (true);

CREATE POLICY "Allow public select on itens_orcamento" ON public.itens_orcamento FOR SELECT USING (true);
CREATE POLICY "Allow public insert on itens_orcamento" ON public.itens_orcamento FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on itens_orcamento" ON public.itens_orcamento FOR DELETE USING (true);
CREATE POLICY "Allow public update on itens_orcamento" ON public.itens_orcamento FOR UPDATE USING (true);
