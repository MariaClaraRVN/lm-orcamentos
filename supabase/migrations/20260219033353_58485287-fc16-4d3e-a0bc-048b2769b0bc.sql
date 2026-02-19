
-- Allow public delete on orcamentos
CREATE POLICY "Allow public delete on orcamentos"
  ON public.orcamentos FOR DELETE
  USING (true);

-- Allow public delete on itens_orcamento
CREATE POLICY "Allow public delete on itens_orcamento"
  ON public.itens_orcamento FOR DELETE
  USING (true);
