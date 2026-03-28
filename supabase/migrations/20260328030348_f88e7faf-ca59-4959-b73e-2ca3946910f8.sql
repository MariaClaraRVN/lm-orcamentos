-- Drop all existing permissive policies and replace with authenticated-only

-- orcamentos
DROP POLICY IF EXISTS "Allow public select on orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Allow public insert on orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Allow public update on orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Allow public delete on orcamentos" ON public.orcamentos;
CREATE POLICY "Authenticated select on orcamentos" ON public.orcamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on orcamentos" ON public.orcamentos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on orcamentos" ON public.orcamentos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on orcamentos" ON public.orcamentos FOR DELETE TO authenticated USING (true);

-- ordens_servico
DROP POLICY IF EXISTS "Allow public select on ordens_servico" ON public.ordens_servico;
DROP POLICY IF EXISTS "Allow public insert on ordens_servico" ON public.ordens_servico;
DROP POLICY IF EXISTS "Allow public update on ordens_servico" ON public.ordens_servico;
DROP POLICY IF EXISTS "Allow public delete on ordens_servico" ON public.ordens_servico;
CREATE POLICY "Authenticated select on ordens_servico" ON public.ordens_servico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on ordens_servico" ON public.ordens_servico FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on ordens_servico" ON public.ordens_servico FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on ordens_servico" ON public.ordens_servico FOR DELETE TO authenticated USING (true);

-- clientes
DROP POLICY IF EXISTS "Allow public select on clientes" ON public.clientes;
DROP POLICY IF EXISTS "Allow public insert on clientes" ON public.clientes;
DROP POLICY IF EXISTS "Allow public update on clientes" ON public.clientes;
DROP POLICY IF EXISTS "Allow public delete on clientes" ON public.clientes;
CREATE POLICY "Authenticated select on clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on clientes" ON public.clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on clientes" ON public.clientes FOR DELETE TO authenticated USING (true);

-- contratos
DROP POLICY IF EXISTS "Allow public select on contratos" ON public.contratos;
DROP POLICY IF EXISTS "Allow public insert on contratos" ON public.contratos;
DROP POLICY IF EXISTS "Allow public update on contratos" ON public.contratos;
DROP POLICY IF EXISTS "Allow public delete on contratos" ON public.contratos;
CREATE POLICY "Authenticated select on contratos" ON public.contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on contratos" ON public.contratos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on contratos" ON public.contratos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on contratos" ON public.contratos FOR DELETE TO authenticated USING (true);

-- diagnosticos
DROP POLICY IF EXISTS "Allow public select on diagnosticos" ON public.diagnosticos;
DROP POLICY IF EXISTS "Allow public insert on diagnosticos" ON public.diagnosticos;
DROP POLICY IF EXISTS "Allow public update on diagnosticos" ON public.diagnosticos;
DROP POLICY IF EXISTS "Allow public delete on diagnosticos" ON public.diagnosticos;
CREATE POLICY "Authenticated select on diagnosticos" ON public.diagnosticos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on diagnosticos" ON public.diagnosticos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on diagnosticos" ON public.diagnosticos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on diagnosticos" ON public.diagnosticos FOR DELETE TO authenticated USING (true);

-- conclusoes
DROP POLICY IF EXISTS "Allow public select on conclusoes" ON public.conclusoes;
DROP POLICY IF EXISTS "Allow public insert on conclusoes" ON public.conclusoes;
DROP POLICY IF EXISTS "Allow public update on conclusoes" ON public.conclusoes;
DROP POLICY IF EXISTS "Allow public delete on conclusoes" ON public.conclusoes;
CREATE POLICY "Authenticated select on conclusoes" ON public.conclusoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on conclusoes" ON public.conclusoes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on conclusoes" ON public.conclusoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on conclusoes" ON public.conclusoes FOR DELETE TO authenticated USING (true);

-- midias_os
DROP POLICY IF EXISTS "Allow public select on midias_os" ON public.midias_os;
DROP POLICY IF EXISTS "Allow public insert on midias_os" ON public.midias_os;
DROP POLICY IF EXISTS "Allow public update on midias_os" ON public.midias_os;
DROP POLICY IF EXISTS "Allow public delete on midias_os" ON public.midias_os;
CREATE POLICY "Authenticated select on midias_os" ON public.midias_os FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on midias_os" ON public.midias_os FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on midias_os" ON public.midias_os FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on midias_os" ON public.midias_os FOR DELETE TO authenticated USING (true);

-- checklists
DROP POLICY IF EXISTS "Allow public select on checklists" ON public.checklists;
DROP POLICY IF EXISTS "Allow public insert on checklists" ON public.checklists;
DROP POLICY IF EXISTS "Allow public update on checklists" ON public.checklists;
DROP POLICY IF EXISTS "Allow public delete on checklists" ON public.checklists;
CREATE POLICY "Authenticated select on checklists" ON public.checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on checklists" ON public.checklists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on checklists" ON public.checklists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on checklists" ON public.checklists FOR DELETE TO authenticated USING (true);

-- checklist_itens
DROP POLICY IF EXISTS "Allow public select on checklist_itens" ON public.checklist_itens;
DROP POLICY IF EXISTS "Allow public insert on checklist_itens" ON public.checklist_itens;
DROP POLICY IF EXISTS "Allow public update on checklist_itens" ON public.checklist_itens;
DROP POLICY IF EXISTS "Allow public delete on checklist_itens" ON public.checklist_itens;
CREATE POLICY "Authenticated select on checklist_itens" ON public.checklist_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on checklist_itens" ON public.checklist_itens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on checklist_itens" ON public.checklist_itens FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on checklist_itens" ON public.checklist_itens FOR DELETE TO authenticated USING (true);

-- itens_orcamento
DROP POLICY IF EXISTS "Allow public select on itens_orcamento" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Allow public insert on itens_orcamento" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Allow public update on itens_orcamento" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Allow public delete on itens_orcamento" ON public.itens_orcamento;
CREATE POLICY "Authenticated select on itens_orcamento" ON public.itens_orcamento FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert on itens_orcamento" ON public.itens_orcamento FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update on itens_orcamento" ON public.itens_orcamento FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete on itens_orcamento" ON public.itens_orcamento FOR DELETE TO authenticated USING (true);
